"use client";

import { useEffect, useState } from "react";
import { isConnectedToGooglePhotos } from "@/lib/google-photos";
import { clearTokens, saveTokens } from "@/lib/storage";

interface GoogleConnectButtonProps {
  onConnectionChange: (connected: boolean) => void;
}

export function GoogleConnectButton({ onConnectionChange }: GoogleConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for tokens in cookie (from OAuth callback)
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((c) => c.trim().startsWith("google_tokens="));

    if (tokenCookie) {
      try {
        const tokenData = JSON.parse(
          decodeURIComponent(tokenCookie.split("=")[1])
        );
        saveTokens(tokenData);
        // Clear the cookie
        document.cookie = "google_tokens=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      } catch (e) {
        console.error("Failed to parse token cookie:", e);
      }
    }

    // Check connection status
    const connected = isConnectedToGooglePhotos();
    setIsConnected(connected);
    onConnectionChange(connected);
    setIsLoading(false);
  }, [onConnectionChange]);

  const handleConnect = () => {
    window.location.href = "/api/auth/google";
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect from Google Photos?")) {
      clearTokens();
      setIsConnected(false);
      onConnectionChange(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-cream-200 h-10 w-48 rounded-lg" />
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Connected to Google Photos
        </span>
        <button
          onClick={handleDisconnect}
          className="text-sm text-gray-500 hover:text-rose-600 underline transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Connect Google Photos
    </button>
  );
}

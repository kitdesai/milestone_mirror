"use client";

import { useEffect, useState } from "react";
import { isConnectedToDropbox, scanPhotos, clearCache, getPhotoCount } from "@/lib/dropbox";
import { clearTokens, saveTokens } from "@/lib/storage";

interface DropboxConnectButtonProps {
  onConnectionChange: (connected: boolean) => void;
}

const FOLDER_PATH_KEY = "milestone-mirror-dropbox-folder";

export function DropboxConnectButton({ onConnectionChange }: DropboxConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved folder path
    const savedPath = localStorage.getItem(FOLDER_PATH_KEY) || "";
    setFolderPath(savedPath);

    // Check for tokens in cookie (from OAuth callback)
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((c) => c.trim().startsWith("dropbox_tokens="));

    if (tokenCookie) {
      try {
        const tokenData = JSON.parse(
          decodeURIComponent(tokenCookie.split("=")[1])
        );
        saveTokens(tokenData);
        // Clear the cookie
        document.cookie = "dropbox_tokens=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        // Show folder input for new connections
        setShowFolderInput(true);
      } catch (e) {
        console.error("Failed to parse token cookie:", e);
      }
    }

    // Check connection status
    const connected = isConnectedToDropbox();
    setIsConnected(connected);

    // If connected and we have a saved path, scan automatically
    if (connected && savedPath) {
      startScan(savedPath);
    } else if (connected) {
      setShowFolderInput(true);
      setIsLoading(false);
    } else {
      onConnectionChange(false);
      setIsLoading(false);
    }
  }, []);

  const startScan = async (path: string) => {
    setIsScanning(true);
    setScanError(null);

    try {
      const count = await scanPhotos(path);
      setPhotoCount(count);
      localStorage.setItem(FOLDER_PATH_KEY, path);
      setShowFolderInput(false);
      onConnectionChange(true);
    } catch (err) {
      console.error("Failed to scan photos:", err);
      setScanError(err instanceof Error ? err.message : "Failed to scan");
      onConnectionChange(false);
    } finally {
      setIsScanning(false);
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/auth/dropbox";
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect from Dropbox?")) {
      clearTokens();
      clearCache();
      localStorage.removeItem(FOLDER_PATH_KEY);
      setIsConnected(false);
      setPhotoCount(0);
      setShowFolderInput(false);
      onConnectionChange(false);
    }
  };

  const handleScanFolder = (e: React.FormEvent) => {
    e.preventDefault();
    startScan(folderPath);
  };

  const handleRescan = () => {
    setShowFolderInput(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Loading...
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Scanning photos in {folderPath || "Dropbox"}...
      </div>
    );
  }

  // Show folder input when connected but no folder selected
  if (isConnected && showFolderInput) {
    return (
      <div className="flex flex-col gap-2">
        <form onSubmit={handleScanFolder} className="flex items-center gap-2">
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="/Camera Uploads"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Scan
          </button>
        </form>
        <p className="text-xs text-gray-500">
          Enter folder path (e.g., /Camera Uploads, /Photos) or leave empty for all
        </p>
        {scanError && (
          <p className="text-xs text-rose-600">{scanError}</p>
        )}
      </div>
    );
  }

  if (isConnected && photoCount > 0) {
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
          {photoCount.toLocaleString()} photos
        </span>
        <button
          onClick={handleRescan}
          className="text-sm text-gray-500 hover:text-blue-600 underline transition-colors"
        >
          Change folder
        </button>
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
        fill="#0061FF"
      >
        <path d="M6 2L0 6l6 4-6 4 6 4 6-4-6-4 6-4-6-4zm12 0l-6 4 6 4-6 4 6 4 6-4-6-4 6-4-6-4zM6 14l6 4 6-4-6-4-6 4z" />
      </svg>
      Connect Dropbox
    </button>
  );
}

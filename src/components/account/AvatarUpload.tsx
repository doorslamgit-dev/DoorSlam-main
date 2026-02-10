import { useState, useRef, useCallback, useEffect } from "react";
import NextImage from "next/image";
import Alert from "../ui/Alert";
import AppIcon from "../ui/AppIcon";
import { supabase } from "../../lib/supabase";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  userType: "parent" | "child";
  userName: string;
  onAvatarChange: (newUrl: string | null) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const CROP_SIZE = 200;
const PREVIEW_SIZE = 200;

function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  const marker = "/storage/v1/object/public/avatars/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

function folderForUserType(userType: "parent" | "child"): "parents" | "children" {
  return userType === "child" ? "children" : "parents";
}

function buildAvatarPath(userType: "parent" | "child", userId: string) {
  const folder = folderForUserType(userType);
  const fileName = `${userId}-${Date.now()}.jpg`;
  return `${folder}/${fileName}`;
}

export default function AvatarUpload({
  currentAvatarUrl,
  userId,
  userType,
  userName,
  onAvatarChange,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const [minZoom, setMinZoom] = useState(0.1);
  const [fitZoom, setFitZoom] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sliderToZoom = useCallback(
    (slider: number): number => {
      if (slider <= 50) {
        const t = slider / 50;
        return minZoom + (fitZoom - minZoom) * t;
      } else {
        const t = (slider - 50) / 50;
        return fitZoom + fitZoom * t;
      }
    },
    [minZoom, fitZoom]
  );

  const actualZoom = sliderToZoom(sliderValue);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setError(null);

      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Please upload a JPEG or PNG image");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Image must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;

        const img = new Image();
        img.onload = () => {
          const natWidth = img.naturalWidth;
          const natHeight = img.naturalHeight;

          setNaturalSize({ width: natWidth, height: natHeight });

          const minDim = Math.min(natWidth, natHeight);
          const calculatedFitZoom = PREVIEW_SIZE / minDim;

          const maxDim = Math.max(natWidth, natHeight);
          const calculatedMinZoom = PREVIEW_SIZE / maxDim;

          setFitZoom(calculatedFitZoom);
          setMinZoom(calculatedMinZoom);

          setSliderValue(50);
          setPosition({ x: 0, y: 0 });
          setImageSrc(src);
          setShowCropper(true);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropAndUpload = async () => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setUploading(true);
    setError(null);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = CROP_SIZE;
      canvas.height = CROP_SIZE;

      const scaledWidth = naturalSize.width * actualZoom;
      const scaledHeight = naturalSize.height * actualZoom;

      const offsetX = (PREVIEW_SIZE - scaledWidth) / 2 + position.x;
      const offsetY = (PREVIEW_SIZE - scaledHeight) / 2 + position.y;

      ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

      ctx.save();
      ctx.beginPath();
      ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("Failed to create image blob");
      }

      if (currentAvatarUrl) {
        const oldPath = getStoragePathFromPublicUrl(currentAvatarUrl);
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const avatarPath = buildAvatarPath(userType, userId);
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(avatarPath, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(avatarPath);

      onAvatarChange(data.publicUrl);

      setShowCropper(false);
      setImageSrc(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setUploading(true);
    setError(null);

    try {
      const oldPath = getStoragePathFromPublicUrl(currentAvatarUrl);
      if (oldPath) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([oldPath]);

        if (deleteError) throw deleteError;
      }

      onAvatarChange(null);
    } catch (err) {
      console.error("Remove error:", err);
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setUploading(false);
    }
  };

  if (showCropper && imageSrc) {
    const scaledWidth = naturalSize.width * actualZoom;
    const scaledHeight = naturalSize.height * actualZoom;
    const offsetX = (PREVIEW_SIZE - scaledWidth) / 2 + position.x;
    const offsetY = (PREVIEW_SIZE - scaledHeight) / 2 + position.y;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-0 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">Crop Your Photo</h3>

          <div className="flex flex-col items-center gap-4">
            <div
              className="relative bg-neutral-100 rounded-full overflow-hidden"
              style={{
                width: PREVIEW_SIZE,
                height: PREVIEW_SIZE,
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL with dynamic inline positioning */}
              <img
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: "absolute",
                  width: scaledWidth,
                  height: scaledHeight,
                  left: offsetX,
                  top: offsetY,
                  pointerEvents: "none",
                }}
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Zoom
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="error" className="w-full" hideIcon>
                {error}
              </Alert>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropAndUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-info text-white rounded-lg hover:bg-info disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {currentAvatarUrl ? (
          <NextImage
            src={currentAvatarUrl}
            alt={userName}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
            {initials}
          </div>
        )}
      </div>

      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
          id="avatar-upload"
        />
        <div className="flex gap-2">
          <label
            htmlFor="avatar-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer disabled:opacity-50"
          >
            <AppIcon name="upload" className="w-4 h-4" />
            {currentAvatarUrl ? "Change Photo" : "Upload Photo"}
          </label>
          {currentAvatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-0 border border-danger text-danger rounded-lg hover:bg-danger-bg disabled:opacity-50"
            >
              <AppIcon name="trash" className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          JPG or PNG, max 2MB
        </p>
        {error && (
          <p className="text-xs text-danger mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}

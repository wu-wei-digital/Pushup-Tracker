"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";

interface ProfilePictureUploadProps {
    currentPicture?: string | null;
    name: string;
    userId: number;
    onUpdate: (url: string | null) => void;
}

export function ProfilePictureUpload({ currentPicture, name, userId, onUpdate }: ProfilePictureUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        setError("");
        setPreview(URL.createObjectURL(file));
        setIsUploading(true);

        try {
            // Upload to Cloudinary
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                // Fallback: convert to base64 and store directly (for development)
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = reader.result as string;
                    await updateProfilePicture(base64);
                };
                reader.readAsDataURL(file);
                return;
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", "pushup-tracker/avatars");

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            // Use a transformed URL for optimized avatar
            const optimizedUrl = data.secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill,g_face/");
            await updateProfilePicture(optimizedUrl);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image. Please try again.");
            setPreview(null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const updateProfilePicture = async (url: string) => {
        const res = await fetch(`/api/users/${userId}/profile-picture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profilePicture: url }),
        });

        if (res.ok) {
            onUpdate(url);
            setPreview(null);
        } else {
            const data = await res.json();
            setError(data.error || "Failed to update profile picture");
            setPreview(null);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        setError("");

        try {
            const res = await fetch(`/api/users/${userId}/profile-picture`, {
                method: "DELETE",
            });

            if (res.ok) {
                onUpdate(null);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to remove profile picture");
            }
        } catch {
            setError("Failed to remove profile picture");
        } finally {
            setIsRemoving(false);
        }
    };

    const displayPicture = preview || currentPicture;

    return (
        <div className="flex flex-col items-center gap-4">
            <Avatar
                src={displayPicture}
                name={name}
                size="xl"
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isRemoving}
                >
                    {isUploading ? "Uploading..." : "Change Photo"}
                </Button>
                {currentPicture && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        disabled={isUploading || isRemoving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        {isRemoving ? "Removing..." : "Remove"}
                    </Button>
                )}
            </div>
        </div>
    );
}

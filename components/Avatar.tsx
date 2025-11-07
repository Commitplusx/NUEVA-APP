import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { FaUserCircle } from 'react-icons/fa';
import { Spinner } from './Spinner';

interface AvatarProps {
  url: string | null;
  size: number;
  onUpload: (filePath: string) => void;
  loading: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ url, size, onUpload, loading: isUploading }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error downloading image: ', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {isUploading || uploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
          <Spinner />
        </div>
      ) : avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="rounded-full" style={{ width: size, height: size, objectFit: 'cover' }} />
      ) : (
        <FaUserCircle className="text-gray-300" size={size} />
      )}
      <div
        className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-2 cursor-pointer hover:bg-gray-600"
        style={{ transform: 'translate(10%, 10%)' }}
      >
        <label htmlFor="single" className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
            />
          </svg>
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          bio: data.bio,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formDataToSend = new FormData();
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('bio', formData.bio);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile(); // Refresh profile data
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Profile picture functionality removed
  };

  const removeProfilePicture = async () => {
    // Profile picture functionality removed
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getInitials = () => {
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 py-8 pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-[26px]">
        <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Profile</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-400 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500 text-green-400 rounded">
              {success}
            </div>
          )}

          {/* Profile Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {getInitials()}
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white text-sm cursor-pointer"
                     onClick={() => document.getElementById('profile-pic-input')?.click()}>
                  Click to change
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            /* View Mode */
            <div>
              <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-semibold text-white">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-[#919191]"><span className="text-white font-medium">Username:</span> @{profile.username}</p>
                <p className="text-[#919191]"><span className="text-white font-medium">Email:</span> {profile.email}</p>
                <p className="text-[#919191]"><span className="text-white font-medium">Bio:</span> {profile.bio || 'No bio added yet.'}</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  Logout
                </Button>
                <Link href="/dashboard">
                  <Button 
                    variant="outline"
                    className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white">
                    First Name
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white">
                  Bio
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-[#919191] mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>
              
                <div className="flex justify-center space-x-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Download, Loader2, Pause, Play, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { IAudio, IAudioResponse } from '@/lib/types';
import { toast } from 'sonner';

// Utility functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number) => {
  if (!seconds) return 'Unknown';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const cleanTitle = (title: string) => {
  return title.replace(/^(TTS_|AUDIO_|VOICE_)/, '').replace(/_/g, ' ');
};

// Custom fuzzy search implementation
const fuzzyScore = (needle: string, haystack: string) => {
  if (!needle) return { score: 1, matched: true };

  const needleLower = needle.toLowerCase();
  const haystackLower = haystack.toLowerCase();

  // Exact match gets highest score
  if (haystackLower === needleLower) return { score: 100, matched: true };

  // Prefix match gets high score
  if (haystackLower.startsWith(needleLower)) {
    return { score: 90 - (haystackLower.length - needleLower.length), matched: true };
  }

  // Contains match
  if (haystackLower.includes(needleLower)) {
    const index = haystackLower.indexOf(needleLower);
    return { score: 70 - index - (haystackLower.length - needleLower.length), matched: true };
  }

  // Fuzzy character matching
  let score = 0;
  let j = 0;

  for (let i = 0; i < needleLower.length; i++) {
    const char = needleLower[i];
    const found = haystackLower.indexOf(char, j);

    if (found === -1) {
      return { score: 0, matched: false };
    }

    score += Math.max(0, 10 - (found - j));
    j = found + 1;
  }

  // Penalty for length difference
  score -= Math.abs(haystackLower.length - needleLower.length);

  return { score: Math.max(0, score), matched: score > 0 };
};


// Audio Player Component
const AudioPlayer = ({ src, title }: { src: string, title: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    // Add event listeners
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    // Clean up event listeners
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
      <audio ref={audioRef} src={src} preload="metadata" />

      <Button
        variant="default"
        size="sm"
        onClick={togglePlay}
        className="h-8 w-8 rounded-full p-0"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <div className="flex-1">
        <div
          className="w-full h-2 bg-slate-200 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
};

// Audio Card Component
const AudioCard = ({ audio, isSelected, onSelect, onDelete }: { audio: IAudio, isSelected: boolean, onSelect: (publicId: string, checked: boolean) => void, onDelete: (publicId: string) => void }) => {
  const title = cleanTitle(audio.title || audio.public_id);
  const isTest = audio.isTest;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked: boolean) => onSelect(audio.public_id, checked)}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {audio.size}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatDuration(audio.duration)}
                </Badge>
                {isTest && (
                  <Badge variant="destructive" className="text-xs">
                    Test
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(audio.public_id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <AudioPlayer src={audio.url} title={title} />

        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <a href={audio.url} download={`${title}.${audio.format}`}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const TTSAudioManager = () => {
  const [audios, setAudios] = useState<IAudioResponse>({ test_audios: [], audios: [] });
  const [filteredAudios, setFilteredAudios] = useState<IAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedAudios, setSelectedAudios] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchAudios = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch("/api/admin/tts/audio-list?page=" + pageNum);
      if (!response.ok) {
        throw new Error(`Error fetching audio files: ${response.status}`);
      }

      const data: IAudioResponse = await response.json();

      if (reset || pageNum === 1) {
        setAudios(data);
      } else {
        setAudios(prev => ({
          test_audios: [...prev.test_audios, ...data.test_audios],
          audios: [...prev.audios, ...data.audios]
        }));
      }
      setPage(pageNum + 1);
    } catch (error) {
      toast.error('Failed to load audios');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const deleteAudio = async (publicId: string) => {
    try {
      const response = await fetch(`/api/admin/tts/audio-list/delete?public_id=${publicId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting audio: ${response.status}`);
      }

      setAudios(prev => ({
        test_audios: prev.test_audios.filter(audio => audio.public_id !== publicId),
        audios: prev.audios.filter(audio => audio.public_id !== publicId)
      }));
      setSelectedAudios(prev => {
        const updated = new Set(prev);
        updated.delete(publicId);
        return updated;
      });

      toast.success('Audio deleted successfully');
    } catch (error) {
      toast.error('Failed to delete audio');
      console.error('Delete error:', error);
    }
  };

  const deleteBatch = async (publicIds: string[]) => {
    try {
      for (const id of publicIds) {
        const response = await fetch(`/api/admin/tts/audio-list/delete?public_id=${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error deleting audios: ${response.status}`);
        }
      }

      setAudios(prev => ({
        test_audios: prev.test_audios.filter(audio => !publicIds.includes(audio.public_id)),
        audios: prev.audios.filter(audio => !publicIds.includes(audio.public_id))
      }));
      setSelectedAudios(new Set());
      toast.success(`${publicIds.length} audio(s) deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete selected audios');
      console.error('Batch delete error:', error);
    }
  };

  // Filter and search logic
  const searchAndFilter = useMemo(() => {
    console.log("audios in searchAndFilter: " + audios.test_audios[0])
    let result = [...(Array.isArray(audios.test_audios) ? audios.test_audios : []), ...(Array.isArray(audios.audios) ? audios.audios : [])];
    // Apply filter
    if (activeFilter === 'Test Audios') {
      result = audios.test_audios
    } else if (activeFilter === 'Real Audios') {
      result = audios.audios
    }

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = result.map(audio => {
        const title = cleanTitle(audio.title || audio.public_id);
        const score = fuzzyScore(searchQuery, title);
        return { ...audio, searchScore: score.score, matched: score.matched };
      }).filter(audio => audio.matched);

      result = searchResults.sort((a, b) => b.searchScore - a.searchScore);
    }

    return result;
  }, [audios, searchQuery, activeFilter]);

  useEffect(() => {
    setFilteredAudios(searchAndFilter);
  }, [searchAndFilter]);

  // Initial load
  useEffect(() => {
    fetchAudios();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
        && !loading && !loadingMore
      ) {
        fetchAudios(page);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore]);

  // Selection handlers
  const handleSelectAll = () => {
    const allIds = new Set(filteredAudios.map(audio => audio.public_id));
    setSelectedAudios(allIds);
  };

  const handleSelectAllTest = () => {
    const testIds = new Set(
      filteredAudios
        .filter(audio =>
          audio.public_id.toLowerCase().includes('test') ||
          (audio.title && audio.title.toLowerCase().includes('test'))
        )
        .map(audio => audio.public_id)
    );
    setSelectedAudios(testIds);
  };

  const handleSelectAudio = (publicId: string, selected: boolean) => {
    setSelectedAudios(prev => {
      const updated = new Set(prev);
      if (selected) {
        updated.add(publicId);
      } else {
        updated.delete(publicId);
      }
      return updated;
    });
  };

  // Confirmation handlers
  const handleSingleDelete = (publicId: string) => {
    const audio = audios.test_audios.find(a => a.public_id === publicId) || audios.audios.find(a => a.public_id === publicId);
    const title = cleanTitle(audio?.title || publicId);

    setConfirmModal({
      title: 'Delete Audio',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteAudio(publicId);
        setConfirmModal(null);
      }
    });
  };

  const handleBatchDelete = () => {
    const count = selectedAudios.size;
    setConfirmModal({
      title: 'Delete Selected Audios',
      message: `Are you sure you want to delete ${count} selected audio(s)? This action cannot be undone.`,
      onConfirm: () => {
        deleteBatch(Array.from(selectedAudios) as string[]);
        setConfirmModal(null);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">TTS Audio Manager</h1>
        <Badge variant="secondary" className="text-sm">
          {audios.test_audios.length + audios.audios.length} Total Files
        </Badge>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search audio files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSelectAll}
              variant="default"
            >
              Select All ({filteredAudios.length})
            </Button>

            <Button
              onClick={handleSelectAllTest}
              variant="secondary"
            >
              Select All Test Audios
            </Button>

            <Button
              onClick={handleBatchDelete}
              disabled={selectedAudios.size === 0}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedAudios.size})
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {['All', 'Test Audios', 'Real Audios'].map(filter => (
              <Button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
              >
                {filter}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Alert>
        <AlertDescription>
          Showing {filteredAudios.length} of {audios.test_audios.length + audios.audios.length} audio files
          {selectedAudios.size > 0 && ` • ${selectedAudios.size} selected`}
        </AlertDescription>
      </Alert>

      {/* Audio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAudios.map(audio => (
          <AudioCard
            key={audio.public_id}
            audio={audio}
            isSelected={selectedAudios.has(audio.public_id)}
            onSelect={handleSelectAudio}
            onDelete={handleSingleDelete}
          />
        ))}
      </div>

      {/* Loading More */}
      {loadingMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* No Results */}
      {filteredAudios.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-slate-500">
              {searchQuery ? 'No audio files match your search.' : 'No audio files found.'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <AlertDialog open={!!confirmModal} onOpenChange={() => setConfirmModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmModal?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmModal?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmModal?.onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
};

export default TTSAudioManager;
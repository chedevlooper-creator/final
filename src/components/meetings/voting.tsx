'use client';

/**
 * Oylama Bileşeni
 * Voting Component
 * 
 * Toplantıda karar almak için oylama
 * Vote for decision making in meetings
 */

import { useState } from 'react';
import { useMeetingVotes, useCreateVote, useSubmitVote } from '@/hooks/queries/use-meetings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { VoteType, VoteStatus } from '@/types/meeting.types';
import { Plus, CheckCircle2, XCircle, Users, BarChart3 } from 'lucide-react';

interface VotingProps {
  meetingId: string;
  isCreator: boolean;
}

export function Voting({ meetingId, isCreator }: VotingProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [voteType, setVoteType] = useState<VoteType>(VoteType.YES_NO);

  const { data: votes, isLoading } = useMeetingVotes(meetingId);
  const createVote = useCreateVote();
  const submitVote = useSubmitVote();

  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createVote.mutateAsync({
      meeting_id: meetingId,
      title,
      description,
      vote_type: voteType,
    });

    setTitle('');
    setDescription('');
    setShowCreateForm(false);
  };

  const handleVote = async (voteId: string, response: any) => {
    await submitVote.mutateAsync({ voteId, response });
  };

  const getVoteResults = (vote: any) => {
    if (!vote.responses || vote.responses.length === 0) {
      return { yes: 0, no: 0, total: 0 };
    }

    if (vote.vote_type === VoteType.YES_NO) {
      const yes = vote.responses.filter((r: any) => r.response === 'yes').length;
      const no = vote.responses.filter((r: any) => r.response === 'no').length;
      return { yes, no, total: vote.responses.length };
    }

    return { total: vote.responses.length };
  };

  const hasUserVoted = (vote: any) => {
    // Check if current user has voted (you'll need to get user ID from auth)
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Create Vote Button (Only for creator) */}
      {isCreator && !showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-gray-600 hover:text-purple-600"
        >
          <Plus className="w-5 h-5" />
          <span>Oylama Başlat</span>
        </button>
      )}

      {/* Create Vote Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateVote} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oylama Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Toplantı saati değiştirilsin mi?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Oylama hakkında detaylı bilgi..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oylama Tipi
            </label>
            <select
              value={voteType}
              onChange={(e) => setVoteType(e.target.value as VoteType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={VoteType.YES_NO}>Evet / Hayır</option>
              <option value={VoteType.MULTIPLE_CHOICE}>Çoktan Seçmeli</option>
              <option value={VoteType.PRIORITY}>Öncelik Sıralaması</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createVote.isPending}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createVote.isPending ? 'Oluşturuluyor...' : 'Oylama Başlat'}
            </button>
          </div>
        </form>
      )}

      {/* Votes List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : !votes || votes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>Henüz oylama başlatılmamış</p>
        </div>
      ) : (
        <div className="space-y-4">
          {votes.map((vote: any) => {
            const results = getVoteResults(vote);
            const hasVoted = hasUserVoted(vote);

            return (
              <div
                key={vote.id}
                className="bg-white rounded-lg border-2 border-gray-200 p-4"
              >
                {/* Vote Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {vote.title}
                    </h3>
                    {vote.description && (
                      <p className="text-sm text-gray-600">{vote.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      vote.status === VoteStatus.ACTIVE
                        ? 'bg-green-100 text-green-700'
                        : vote.status === VoteStatus.CLOSED
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {vote.status === VoteStatus.ACTIVE && '🟢 '}
                    {vote.status === VoteStatus.CLOSED && '⚫ '}
                    {vote.status.toUpperCase()}
                  </span>
                </div>

                {/* Vote Type: YES_NO */}
                {vote.vote_type === VoteType.YES_NO && vote.status === VoteStatus.ACTIVE && !hasVoted && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => handleVote(vote.id, 'yes')}
                      disabled={submitVote.isPending}
                      className="flex items-center justify-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Evet</span>
                    </button>
                    <button
                      onClick={() => handleVote(vote.id, 'no')}
                      disabled={submitVote.isPending}
                      className="flex items-center justify-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Hayır</span>
                    </button>
                  </div>
                )}

                {/* Results Bar */}
                {vote.vote_type === VoteType.YES_NO && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Evet: {results.yes}</span>
                      <span>Hayır: {results.no}</span>
                      <span>Toplam: {results.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
                      {results.total > 0 && (
                        <>
                          <div
                            className="bg-green-600 h-full transition-all"
                            style={{ width: `${(results.yes / results.total) * 100}%` }}
                          />
                          <div
                            className="bg-red-600 h-full transition-all"
                            style={{ width: `${(results.no / results.total) * 100}%` }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{results.total} oy</span>
                  </div>
                  <span>
                    {format(new Date(vote.created_at), 'd MMM HH:mm', { locale: tr })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// src/pages/child/ChildRewardsCatalog.tsx
// FEAT-013 Phase 3b: Full child rewards experience
// Hero card, catalog browse, my rewards, pending, history

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../../components/layout';
import AppIcon from '../../components/ui/AppIcon';
import { supabase } from '../../lib/supabase';
import type {
  RewardsDashboard,
  CatalogItem,
  MyReward,
  PendingRedemption,
  AdditionRequest,
  RedemptionHistoryItem,
} from '../../types/child/childRewardTypes';

// Category styling
function getCategoryStyle(code: string): { bg: string; text: string; icon: string } {
  const styles: Record<string, { bg: string; text: string; icon: string }> = {
    screen_time: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'monitor' },
    treats: { bg: 'bg-pink-100', text: 'text-pink-600', icon: 'candy' },
    activities: { bg: 'bg-green-100', text: 'text-green-600', icon: 'ticket' },
    pocket_money: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'wallet' },
    privileges: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'crown' },
    custom: { bg: 'bg-neutral-100', text: 'text-neutral-600', icon: 'gift' },
  };
  return styles[code] || styles.custom;
}

export function ChildRewardsCatalog() {
  const { activeChildId } = useAuth();
  
  // Dashboard state
  const [dashboard, setDashboard] = useState<RewardsDashboard | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [myRewards, setMyRewards] = useState<MyReward[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<PendingRedemption[]>([]);
  const [additionRequests, setAdditionRequests] = useState<AdditionRequest[]>([]);
  const [history, setHistory] = useState<RedemptionHistoryItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Active tab for sections
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-rewards' | 'history'>('my-rewards');

  const childId = useMemo(() => {
    if (activeChildId) return activeChildId;
    return localStorage.getItem('active_child_id');
  }, [activeChildId]);

  // Load all data
  useEffect(() => {
    if (!childId) {
      setError('No active profile found');
      setLoading(false);
      return;
    }
    loadAllData();
  }, [childId]);

  async function loadAllData() {
    if (!childId) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch dashboard stats
      const { data: dashData, error: dashErr } = await supabase
        .rpc('rpc_get_child_rewards_dashboard', { p_child_id: childId });
      if (dashErr) throw dashErr;
      setDashboard(dashData);

      // Fetch catalog
      const { data: catData, error: catErr } = await supabase
        .rpc('rpc_get_reward_catalog_for_child', { p_child_id: childId });
      if (catErr) throw catErr;
      setCatalog(catData || []);

      // Fetch my rewards
      const { data: myData, error: myErr } = await supabase
        .rpc('rpc_get_child_rewards_catalog', { p_child_id: childId });
      if (myErr) throw myErr;
      setMyRewards(myData?.rewards || []);

      // Fetch pending redemptions
      const { data: pendData, error: pendErr } = await supabase
        .rpc('rpc_get_redemption_history', { p_child_id: childId, p_limit: 50 });
      if (!pendErr && pendData) {
        setPendingRedemptions(pendData.filter((r: any) => r.status === 'pending'));
        setHistory(pendData.filter((r: any) => r.status !== 'pending'));
      }

      // Fetch addition requests
      const { data: addData, error: addErr } = await supabase
        .rpc('rpc_get_my_addition_requests', { p_child_id: childId });
      if (!addErr) {
        setAdditionRequests(addData || []);
      }

    } catch (err: any) {
      console.error('Error loading rewards data:', err);
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  }

  // Request reward be added
  async function handleRequestAddition(templateId: string) {
    if (!childId) return;
    setActionLoading(templateId);

    try {
      const { data, error } = await supabase
        .rpc('rpc_request_reward_addition', {
          p_child_id: childId,
          p_template_id: templateId
        });

      if (error) throw error;
      if (!data.success) {
        alert(data.error || 'Could not send request');
        return;
      }

      // Refresh data
      await loadAllData();
    } catch (err: any) {
      console.error('Error requesting addition:', err);
      alert('Failed to send request');
    } finally {
      setActionLoading(null);
    }
  }

  // Request redemption
  async function handleRequestRedemption(rewardId: string) {
    if (!childId) return;
    setActionLoading(rewardId);

    try {
      const { data, error } = await supabase
        .rpc('rpc_request_reward_redemption', {
          p_child_id: childId,
          p_reward_id: rewardId
        });

      if (error) throw error;
      if (!data.success) {
        alert(data.error || 'Could not request reward');
        return;
      }

      await loadAllData();
    } catch (err: any) {
      console.error('Error requesting redemption:', err);
      alert('Failed to request reward');
    } finally {
      setActionLoading(null);
    }
  }

  // Cancel redemption
  async function handleCancelRedemption(redemptionId: string) {
    setActionLoading(redemptionId);
    try {
      const { data: _data, error } = await supabase
        .rpc('rpc_cancel_redemption_request', { p_redemption_id: redemptionId });

      if (error) throw error;
      await loadAllData();
    } catch (err) {
      console.error('Error cancelling:', err);
    } finally {
      setActionLoading(null);
    }
  }

  // Loading state
  if (loading) {
    return (
      <PageLayout bgColor="bg-neutral-100">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-neutral-600">Loading rewards...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout bgColor="bg-neutral-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Pending addition requests (not yet approved)
  const pendingAdditions = additionRequests.filter(r => r.status === 'pending');
  
  // Unlocked rewards (can afford)
  const unlockedRewards = myRewards.filter(r => r.can_afford && r.is_available);

  return (
    <PageLayout bgColor="bg-neutral-100">
      <main className="max-w-[1120px] mx-auto px-4 py-6">
        
        {/* Page Header */}
        <section className="mb-6">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">My Rewards 🎁</h1>
          <p className="text-neutral-500">
            Earn points from your revision sessions and spend them on rewards!
          </p>
        </section>

        {/* Hero Stats Card */}
        {dashboard && (
          <section className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Points Balance - Large */}
              <div className="col-span-2 lg:col-span-1 bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AppIcon name="star" className="w-5 h-5 text-amber-300" />
                  <span className="text-white/80 text-sm">Points Balance</span>
                </div>
                <p className="text-4xl font-bold">{dashboard.points_balance}</p>
              </div>
              
              {/* Stats Grid */}
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/80 text-sm mb-1">Total Earned</p>
                <p className="text-2xl font-bold">{dashboard.total_earned}</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/80 text-sm mb-1">Rewards Unlocked</p>
                <p className="text-2xl font-bold">{dashboard.unlocked_count}</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/80 text-sm mb-1">Rewards Redeemed</p>
                <p className="text-2xl font-bold">{dashboard.total_redeemed}</p>
              </div>
            </div>
          </section>
        )}

        {/* Pending Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Pending Redemptions */}
          {pendingRedemptions.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <AppIcon name="clock" className="w-5 h-5 text-amber-600" />
                Waiting for Parent Approval
              </h3>
              <div className="space-y-2">
                {pendingRedemptions.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji || '🎁'}</span>
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{item.reward_name}</p>
                        <p className="text-xs text-neutral-500">{item.points_cost} points</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelRedemption(item.id)}
                      disabled={actionLoading === item.id}
                      className="text-xs text-neutral-500 hover:text-red-600 px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Addition Requests */}
          {pendingAdditions.length > 0 && (
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200">
              <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <AppIcon name="send" className="w-5 h-5 text-purple-600" />
                Requests Sent to Parent
              </h3>
              <div className="space-y-2">
                {pendingAdditions.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">{item.category_icon || '🎁'}</span>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{item.template_name}</p>
                      <p className="text-xs text-neutral-500">{item.category_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('my-rewards')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'my-rewards'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            My Rewards ({myRewards.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'catalog'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Browse Catalog ({catalog.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            History ({history.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* MY REWARDS TAB */}
          {activeTab === 'my-rewards' && (
            <>
              {myRewards.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AppIcon name="gift" className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">No rewards yet!</h3>
                  <p className="text-neutral-600 mb-4">
                    Browse the catalog and ask your parent to add some rewards.
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <>
                  {/* Unlocked - Ready to claim */}
                  {unlockedRewards.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-card p-6">
                      <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                        <AppIcon name="unlock" className="w-5 h-5 text-accent-green" />
                        Ready to Claim!
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {unlockedRewards.map((reward) => {
                          const style = getCategoryStyle(reward.category_code);
                          return (
                            <button
                              key={reward.id}
                              onClick={() => handleRequestRedemption(reward.id)}
                              disabled={actionLoading === reward.id}
                              className="bg-neutral-50 rounded-2xl p-4 border-2 border-accent-green/30 hover:border-accent-green hover:shadow-md transition-all text-left disabled:opacity-50"
                            >
                              <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center mb-3`}>
                                <span className="text-2xl">{reward.emoji || '🎁'}</span>
                              </div>
                              <p className="font-medium text-neutral-900 text-sm mb-1 line-clamp-2">
                                {reward.name}
                              </p>
                              <p className="text-amber-600 font-bold text-sm">
                                {reward.points_cost} pts
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Locked - Need more points */}
                  {myRewards.filter(r => !r.can_afford).length > 0 && (
                    <div className="bg-white rounded-2xl shadow-card p-6">
                      <h3 className="text-lg font-semibold text-neutral-500 mb-4">
                        Keep Working Towards
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {myRewards.filter(r => !r.can_afford).map((reward) => {
                          const style = getCategoryStyle(reward.category_code);
                          const pointsNeeded = reward.points_cost - (dashboard?.points_balance || 0);
                          const progress = Math.min(100, ((dashboard?.points_balance || 0) / reward.points_cost) * 100);

                          return (
                            <div key={reward.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                              <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center mb-3 opacity-50`}>
                                <span className="text-2xl grayscale">{reward.emoji || '🎁'}</span>
                              </div>
                              <p className="font-medium text-neutral-700 text-sm mb-1 line-clamp-2">
                                {reward.name}
                              </p>
                              <p className="text-neutral-500 text-sm mb-2">{reward.points_cost} pts</p>
                              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <p className="text-xs text-neutral-400">{pointsNeeded} more needed</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* CATALOG TAB */}
          {activeTab === 'catalog' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <p className="text-neutral-600 mb-4">
                Browse all available rewards. Ask your parent to add ones you'd like!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {catalog.map((item) => {
                  const style = getCategoryStyle(item.category_code);
                  const isAdded = item.is_added;
                  const isPending = item.request_pending;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-4 border-2 transition-all ${
                        isAdded 
                          ? 'bg-accent-green/5 border-accent-green/30' 
                          : isPending
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-neutral-50 border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <span className="text-2xl">{item.category_icon || '🎁'}</span>
                      </div>
                      <p className="font-medium text-neutral-900 text-sm mb-1 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 mb-2">{item.category_name}</p>
                      <p className="text-amber-600 font-bold text-sm mb-3">
                        ~{item.suggested_points} pts
                      </p>

                      {isAdded ? (
                        <span className="inline-flex items-center gap-1 text-xs text-accent-green font-medium">
                          <AppIcon name="check" className="w-3 h-3" />
                          In your list
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
                          <AppIcon name="clock" className="w-3 h-3" />
                          Request sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestAddition(item.id)}
                          disabled={actionLoading === item.id}
                          className="w-full py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading === item.id ? 'Sending...' : 'Ask Parent to Add'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AppIcon name="history" className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">No history yet</h3>
                  <p className="text-sm text-neutral-500">
                    Your redeemed rewards will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.emoji || '🎁'}</span>
                        <div>
                          <p className="font-medium text-neutral-900 text-sm">{item.reward_name}</p>
                          <p className="text-xs text-neutral-500">
                            {new Date(item.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 font-medium text-sm">-{item.points_cost}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.status === 'approved' ? 'bg-green-100 text-green-700' :
                          item.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
}

export default ChildRewardsCatalog;
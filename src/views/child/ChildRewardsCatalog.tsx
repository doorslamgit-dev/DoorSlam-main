// src/views/child/ChildRewardsCatalog.tsx
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
    screen_time: { bg: 'bg-info/10', text: 'text-info', icon: 'monitor' },
    treats: { bg: 'bg-destructive/10', text: 'text-destructive', icon: 'candy' },
    activities: { bg: 'bg-success/10', text: 'text-success', icon: 'ticket' },
    pocket_money: { bg: 'bg-warning/10', text: 'text-warning', icon: 'wallet' },
    privileges: { bg: 'bg-primary/10', text: 'text-primary', icon: 'crown' },
    custom: { bg: 'bg-secondary', text: 'text-muted-foreground', icon: 'gift' },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadAllData uses current state via closure
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
        setPendingRedemptions(pendData.filter((r: Record<string, unknown>) => r.status === 'pending'));
        setHistory(pendData.filter((r: Record<string, unknown>) => r.status !== 'pending'));
      }

      // Fetch addition requests
      const { data: addData, error: addErr } = await supabase
        .rpc('rpc_get_my_addition_requests', { p_child_id: childId });
      if (!addErr) {
        setAdditionRequests(addData || []);
      }

    } catch (err: unknown) {
      console.error('Error loading rewards data:', err);
      setError((err instanceof Error ? err.message : 'Failed to load rewards'));
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
      <PageLayout bgColor="bg-transparent">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Loading rewards...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout bgColor="bg-transparent">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
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
    <PageLayout bgColor="bg-transparent">
      <main className="max-w-[1120px] mx-auto px-6 py-8">
        
        {/* Page Header */}
        <section className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Rewards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Earn points from your revision sessions and spend them on rewards!
          </p>
        </section>

        {/* Hero Stats Card */}
        {dashboard && (
          <section className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Points Balance - Large */}
              <div className="col-span-2 lg:col-span-1 bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AppIcon name="star" className="w-5 h-5 text-warning" />
                  <span className="text-primary-foreground/80 text-sm">Points Balance</span>
                </div>
                <p className="text-4xl font-bold">{dashboard.points_balance}</p>
              </div>
              
              {/* Stats Grid */}
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-primary-foreground/80 text-sm mb-1">Total Earned</p>
                <p className="text-2xl font-bold">{dashboard.total_earned}</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-primary-foreground/80 text-sm mb-1">Rewards Unlocked</p>
                <p className="text-2xl font-bold">{dashboard.unlocked_count}</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-primary-foreground/80 text-sm mb-1">Rewards Redeemed</p>
                <p className="text-2xl font-bold">{dashboard.total_redeemed}</p>
              </div>
            </div>
          </section>
        )}

        {/* Pending Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Pending Redemptions */}
          {pendingRedemptions.length > 0 && (
            <div className="bg-warning/10 rounded-2xl p-5 border border-warning/20">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <AppIcon name="clock" className="w-5 h-5 text-warning" />
                Waiting for Parent Approval
              </h3>
              <div className="space-y-2">
                {pendingRedemptions.map((item) => (
                  <div key={item.id} className="bg-background rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AppIcon name="gift" className="w-5 h-5 text-warning flex-shrink-0" aria-hidden />
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.reward_name}</p>
                        <p className="text-xs text-muted-foreground">{item.points_cost} points</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelRedemption(item.id)}
                      disabled={actionLoading === item.id}
                      className="text-xs text-muted-foreground hover:text-destructive px-2 py-1"
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
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <AppIcon name="send" className="w-5 h-5 text-primary" />
                Requests Sent to Parent
              </h3>
              <div className="space-y-2">
                {pendingAdditions.map((item) => (
                  <div key={item.id} className="bg-background rounded-xl p-3 flex items-center gap-3">
                    <AppIcon name={getCategoryStyle(item.category_code).icon as import('../../components/ui/AppIcon').IconKey} className="w-5 h-5 flex-shrink-0" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.template_name}</p>
                      <p className="text-xs text-muted-foreground">{item.category_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('my-rewards')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'my-rewards'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            My Rewards ({myRewards.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'catalog'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Browse Catalog ({catalog.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
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
                <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AppIcon name="gift" className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No rewards yet!</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse the catalog and ask your parent to add some rewards.
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <>
                  {/* Unlocked - Ready to claim */}
                  {unlockedRewards.length > 0 && (
                    <div className="bg-background rounded-2xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                        <AppIcon name="unlock" className="w-5 h-5 text-success" />
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
                              className="bg-muted rounded-2xl p-4 border-2 border-success/30 hover:border-success hover:shadow-md transition-all text-left disabled:opacity-50"
                            >
                              <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center mb-3`}>
                                <AppIcon name={style.icon as import('../../components/ui/AppIcon').IconKey} className={`w-6 h-6 ${style.text}`} aria-hidden />
                              </div>
                              <p className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                                {reward.name}
                              </p>
                              <p className="text-warning font-bold text-sm">
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
                    <div className="bg-background rounded-2xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-muted-foreground mb-4">
                        Keep Working Towards
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {myRewards.filter(r => !r.can_afford).map((reward) => {
                          const style = getCategoryStyle(reward.category_code);
                          const pointsNeeded = reward.points_cost - (dashboard?.points_balance || 0);
                          const progress = Math.min(100, ((dashboard?.points_balance || 0) / reward.points_cost) * 100);

                          return (
                            <div key={reward.id} className="bg-muted rounded-2xl p-4 border border-border">
                              <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center mb-3 opacity-50`}>
                                <AppIcon name={style.icon as import('../../components/ui/AppIcon').IconKey} className={`w-6 h-6 ${style.text}`} aria-hidden />
                              </div>
                              <p className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                                {reward.name}
                              </p>
                              <p className="text-muted-foreground text-sm mb-2">{reward.points_cost} pts</p>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-warning rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <p className="text-xs text-muted-foreground">{pointsNeeded} more needed</p>
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
            <div className="bg-background rounded-2xl shadow-sm p-6">
              <p className="text-muted-foreground mb-4">
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
                          ? 'bg-success/5 border-success/30'
                          : isPending
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted border-border hover:border-primary'
                      }`}
                    >
                      <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <AppIcon name={style.icon as import('../../components/ui/AppIcon').IconKey} className={`w-6 h-6 ${style.text}`} aria-hidden />
                      </div>
                      <p className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">{item.category_name}</p>
                      <p className="text-warning font-bold text-sm mb-3">
                        ~{item.suggested_points} pts
                      </p>

                      {isAdded ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                          <AppIcon name="check" className="w-3 h-3" />
                          In your list
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                          <AppIcon name="clock" className="w-3 h-3" />
                          Request sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestAddition(item.id)}
                          disabled={actionLoading === item.id}
                          className="w-full py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
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
            <div className="bg-background rounded-2xl shadow-sm p-6">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <AppIcon name="history" className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No history yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your redeemed rewards will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        <AppIcon name="gift" className="w-5 h-5 text-warning flex-shrink-0" aria-hidden />
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.reward_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-warning font-medium text-sm">-{item.points_cost}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.status === 'approved' ? 'bg-success/10 text-success' :
                          item.status === 'declined' ? 'bg-destructive/10 text-destructive' :
                          'bg-secondary text-muted-foreground'
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
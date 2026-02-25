'use client';

import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { AuthGuard } from '../../components/auth-guard';
import { Button } from '../../components/ui/button';
import { getSupabase } from '../../lib/supabase';
import { User, Mail, Shield, Zap, Save, Loader2, Terminal } from 'lucide-react';

export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfileContent />
        </AuthGuard>
    );
}

function ProfileContent() {
    const { user, profile, fetchProfile } = useAuthStore();
    const [username, setUsername] = useState(profile?.username || '');
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const isUnlimitedCreditsUser =
        profile?.role === 'admin' || profile?.username?.trim().toLowerCase() === 'sys_admin';

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        const supabase = getSupabase();
        await supabase.from('profiles').update({ username, full_name: fullName }).eq('id', user.id);
        await fetchProfile();
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-void relative overflow-hidden text-text-main font-mono">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none z-0" />
            <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />

            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-3">
                        <User className="h-3 w-3" />
                        <span>MY ACCOUNT</span>
                    </div>
                    <h1 className="text-3xl font-bold font-mono text-white uppercase tracking-widest mt-2 border-b border-border-std pb-4">
                        USER <span className="text-magenta">PROFILE</span>
                    </h1>
                </div>

                <div className="space-y-8">
                    {/* Avatar & Role */}
                    <div className="bg-panel border border-border-std p-6 relative animate-slide-up shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan/50"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-magenta/50"></div>

                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 border-2 border-cyan bg-void flex items-center justify-center relative shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan"></div>
                                <span className="text-cyan text-3xl font-bold font-display uppercase">
                                    {(profile?.full_name || user?.email || 'U')[0]}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-mono text-white tracking-widest uppercase">{profile?.full_name || profile?.username || 'GUEST'}</h2>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <span className="flex items-center gap-2 text-[10px] tracking-widest px-3 py-1 border border-cyan/30 bg-cyan/10 text-cyan font-bold uppercase">
                                        <Shield className="h-3 w-3" />
                                        ROLE: {profile?.role || 'CUSTOMER'}
                                    </span>
                                    <span className="flex items-center gap-2 text-[10px] tracking-widest px-3 py-1 border border-magenta/30 bg-magenta/10 text-magenta font-bold uppercase">
                                        <Zap className="h-3 w-3" />
                                        CREDITS: {isUnlimitedCreditsUser ? 'UNLIMITED' : `${profile?.ai_credits ?? 0} CR`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    {/* Edit Form */}
                    <div className="bg-panel border border-border-std p-8 relative animate-slide-up animation-delay-100 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50"></div>
                        <h3 className="font-mono font-bold text-white uppercase tracking-widest flex items-center gap-3 mb-6 border-b border-border-std pb-2">
                            <Terminal className="w-5 h-5 text-cyan" />
                            ACCOUNT DETAILS
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-2">EMAIL ADDRESS</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 bg-void border border-border-std font-mono text-xs text-text-dim opacity-70 cursor-not-allowed uppercase"
                                    />
                                </div>
                                <p className="text-[9px] text-text-dim mt-2 tracking-widest uppercase">&gt; EMAIL CANNOT BE CHANGED</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-2">FULL NAME</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="> Enter Name..."
                                        className="w-full pl-10 pr-4 py-3 bg-void border border-border-std font-mono text-xs text-white focus:outline-none focus:border-cyan focus:ring-0 transition-colors uppercase placeholder:normal-case placeholder:text-text-dim/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-2">USERNAME</label>
                                <div className="relative">
                                    <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="> Enter Username..."
                                        className="w-full pl-10 pr-4 py-3 bg-void border border-border-std font-mono text-xs text-white focus:outline-none focus:border-cyan focus:ring-0 transition-colors placeholder:normal-case placeholder:text-text-dim/50"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSave}
                                className="w-full py-4 mt-4 rounded-none bg-cyan/10 border border-cyan text-cyan font-mono font-bold tracking-widest uppercase hover:bg-cyan hover:text-void animate-in transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50"
                                disabled={saving}
                            >
                                {saving ? (
                                    <><Loader2 className="mr-3 h-4 w-4 animate-spin" /> SAVING...</>
                                ) : saved ? (
                                    <><Save className="mr-3 h-4 w-4" /> SAVED</>
                                ) : (
                                    <><Save className="mr-3 h-4 w-4" /> SAVE CHANGES</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { AuthGuard } from '../../components/auth-guard';
import { Button } from '../../components/ui/button';
import { getSupabase } from '../../lib/supabase';
import { User, Mail, Shield, Zap, Save, Loader2 } from 'lucide-react';

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
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-display mb-8 animate-fade-in">
                    My <span className="gradient-text">Profile</span>
                </h1>

                <div className="space-y-6">
                    {/* Avatar & Role */}
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg">
                                <span className="text-white text-2xl font-bold">
                                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{profile?.full_name || profile?.username || 'User'}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-medium capitalize">
                                        <Shield className="h-3 w-3" />
                                        {profile?.role || 'customer'}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                        <Zap className="h-3 w-3" />
                                        {profile?.ai_credits ?? 0} credits
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-up animation-delay-100">
                        <h3 className="font-semibold mb-4">Account Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm opacity-60 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Choose a username"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                                />
                            </div>

                            <Button onClick={handleSave} variant="gradient" disabled={saving}>
                                {saving ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : saved ? (
                                    <><Save className="mr-2 h-4 w-4" /> Saved!</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

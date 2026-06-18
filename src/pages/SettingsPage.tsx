import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, User, CreditCard, Shield, Palette, Loader2,
  Save, LogOut, Crown, Sparkles, Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  if (!user) { navigate("/login"); return null; }

  const planColors: Record<string, string> = {
    free: "bg-[#F2F0EA] text-[#8C8C8C]",
    basic: "bg-[#BBDEFB] text-blue-700",
    pro: "bg-gradient-to-r from-[#F2C84F] to-[#E85D3F] text-white",
  };

  return (
    <div className="min-h-screen bg-[#F2F0EA]">
      <div className="border-b border-[#E5E5E5] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[800px] mx-auto px-6 h-14 flex items-center">
          <Button onClick={() => navigate("/dashboard")} variant="ghost" className="text-[#8C8C8C] hover:text-black text-sm">
            <ArrowLeft className="mr-2 w-4 h-4" /> Кабинет
          </Button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-8">
        <h1 className="text-3xl font-['Instrument_Serif'] mb-8">Настройки</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-8 bg-white rounded-xl border border-[#E5E5E5] p-1">
            {[
              { id: "profile", icon: User, label: "Профиль" },
              { id: "subscription", icon: CreditCard, label: "Подписка" },
              { id: "appearance", icon: Palette, label: "Внешний вид" },
              { id: "security", icon: Shield, label: "Безопасность" },
            ].map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="rounded-lg text-xs data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-1.5">
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card className="border-[#E5E5E5] rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-medium">Профиль</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-['Instrument_Serif']">
                    {user.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name || "Пользователь"}</p>
                    <p className="text-xs text-[#8C8C8C]">{user.email}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${planColors[user.plan || "free"]}`}>
                      {(user.plan || "free").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Имя</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-lg border-[#E5E5E5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Email</Label>
                  <Input value={user.email || ""} disabled className="h-10 rounded-lg border-[#E5E5E5] bg-[#FAFAFA]" />
                </div>
                <Button onClick={() => setSaving(true)} className="rounded-xl bg-black hover:bg-black/90 h-10">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Сохранить</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription */}
          <TabsContent value="subscription">
            <Card className="border-[#E5E5E5] rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-medium">Текущая подписка</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.plan === "pro" ? "bg-gradient-to-r from-[#F2C84F] to-[#E85D3F] text-white" : "bg-[#F2F0EA]"}`}>
                      {user.plan === "pro" ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-[#8C8C8C]" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{user.plan || "free"}</p>
                      <p className="text-xs text-[#8C8C8C]">Осталось генераций: {user.generationsLeft ?? "∞"}</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/subscriptions")} variant="outline" className="rounded-xl h-9 text-xs">
                    Изменить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <Card className="border-[#E5E5E5] rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-medium">Внешний вид</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl">
                  <span className="text-sm">Тёмная тема</span>
                  <button onClick={() => setDarkMode(!darkMode)}
                    className={`w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-black" : "bg-[#E5E5E5]"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl">
                  <span className="text-sm">Уведомления</span>
                  <button onClick={() => setNotifications(!notifications)}
                    className={`w-11 h-6 rounded-full transition-colors ${notifications ? "bg-black" : "bg-[#E5E5E5]"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="border-[#E5E5E5] rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-medium">Безопасность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full h-10 rounded-xl border-[#E5E5E5] text-sm justify-start">
                  <Shield className="w-4 h-4 mr-2" /> Сменить пароль
                </Button>
                <Button variant="outline" className="w-full h-10 rounded-xl border-[#E5E5E5] text-sm justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Удалить аккаунт
                </Button>
                <div className="border-t border-[#E5E5E5] pt-4 mt-4">
                  <Button onClick={() => { logout(); navigate("/"); }}
                    className="w-full h-10 rounded-xl bg-black text-white hover:bg-black/90">
                    <LogOut className="w-4 h-4 mr-2" /> Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

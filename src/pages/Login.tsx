import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, UserPlus } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  const loginMutation = trpc.account.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setLoginError(err.message || "Ошибка входа");
    },
  });

  const registerMutation = trpc.account.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setRegError(err.message || "Ошибка регистрации");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Заполните все поля");
      return;
    }
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword) {
      setRegError("Заполните все поля");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Пароль должен быть минимум 6 символов");
      return;
    }
    registerMutation.mutate({
      name: regName,
      email: regEmail,
      password: regPassword,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F2F0EA" }}
    >
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="black" strokeWidth="1.5" />
            <text
              x="20"
              y="28"
              fontFamily="serif"
              fontSize="22"
              textAnchor="middle"
              fill="black"
            >
              A
            </text>
          </svg>
          <span className="font-['Instrument_Serif'] text-xl">Academix</span>
        </div>

        <Card className="border-[#E5E5E5] shadow-lg rounded-[14px]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-['Instrument_Serif']">
              Добро пожаловать
            </CardTitle>
            <p className="text-xs text-[#8C8C8C] mt-1">
              Войдите или зарегистрируйтесь
            </p>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 mb-6 bg-[#F2F0EA] rounded-[10px]">
                <TabsTrigger
                  value="login"
                  className="rounded-[8px] text-xs data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Вход
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-[8px] text-xs data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="h-11 rounded-[10px] border-[#E5E5E5] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Пароль</Label>
                    <Input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Введите пароль"
                      className="h-11 rounded-[10px] border-[#E5E5E5] text-sm"
                    />
                  </div>

                  {loginError && (
                    <p className="text-xs text-red-500">{loginError}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-[14px] bg-black text-white hover:bg-black/90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="mr-2 w-4 h-4" />
                        Войти
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Имя</Label>
                    <Input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ваше имя"
                      className="h-11 rounded-[10px] border-[#E5E5E5] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="h-11 rounded-[10px] border-[#E5E5E5] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Пароль</Label>
                    <Input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      className="h-11 rounded-[10px] border-[#E5E5E5] text-sm"
                    />
                  </div>

                  {regError && (
                    <p className="text-xs text-red-500">{regError}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-[14px] bg-black text-white hover:bg-black/90"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="mr-2 w-4 h-4" />
                        Зарегистрироваться
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#8C8C8C]">или</span>
              </div>
            </div>

            {/* OAuth */}
            <Button
              variant="outline"
              className="w-full h-11 rounded-[14px] border-[#E5E5E5] text-sm hover:bg-[#F2F0EA]"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              <svg
                className="mr-2 w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
                <text
                  x="12"
                  y="17"
                  fontFamily="serif"
                  fontSize="12"
                  textAnchor="middle"
                  fill="currentColor"
                >
                  K
                </text>
              </svg>
              Войти через Kimi
            </Button>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-[#8C8C8C] hover:text-black transition-colors underline underline-offset-4"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}

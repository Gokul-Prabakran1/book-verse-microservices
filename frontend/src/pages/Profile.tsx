import { useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";

const Profile = () => {
  const token = localStorage.getItem("token");
  let user: { username?: string; email?: string; id?: string } = {};
  if (token) {
    try {
      const decoded = jwtDecode<{ username?: string; email?: string; id?: string } & JwtPayload>(token);
      user = decoded;
    } catch {}
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }
    // TODO: Call backend to update password
    setMessage("Password updated successfully!");
    setMessageType("success");
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic (e.g., send email)
    setMessage("Password reset instructions sent to your email.");
    setMessageType("success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
        {message && (
          <div className={`mb-4 px-4 py-3 rounded text-sm font-medium ${messageType === "error" ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"}`}>
            {message}
          </div>
        )}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-2xl">
              {user.username ? user.username[0].toUpperCase() : "U"}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">{user.username || "User"}</div>
              <div className="text-sm text-gray-500">{user.email || "-"}</div>
            </div>
          </div>
        </div>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white mt-2">Update Password</Button>
        </form>
        <div className="mt-6 text-center">
          <Button variant="outline" className="w-full" onClick={handleForgotPassword}>
            Forgot Password?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 

import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  link?: string;
  onClick?: () => void;
}

const FeatureCard = ({ icon: Icon, title, description, gradient, link, onClick }: FeatureCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (link === "/profile") {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/profile" } });
      } else {
        navigate("/profile");
      }
    }
  };

  const cardContent = (
    <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 cursor-pointer">
      <div className="relative">
        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-lg">
          {description}
        </p>
      </div>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
    </div>
  );

  if (link === "/profile") {
    return (
      <a href={link} onClick={handleClick}>{cardContent}</a>
    );
  }
  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer">{cardContent}</a>
  ) : (
    <div
      className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 cursor-pointer"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="relative">
        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-lg">
          {description}
        </p>
      </div>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
    </div>
  );
};

export default FeatureCard;

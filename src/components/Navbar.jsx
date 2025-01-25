import { useWallet } from "../contexts/WalletContext";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";
import { User } from "lucide-react";

const Navbar = () => {
  const { account, connectWallet, isCorrectNetwork, switchNetwork } =
    useWallet();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleWalletClick = async () => {
    if (!account) {
      await connectWallet();
    } else if (!isCorrectNetwork) {
      await switchNetwork();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        isScrolled ? "bg-white/60 backdrop-blur-lg" : "bg-white"
      }`}
    >
      <div className="max-w-full w-full px-[12.5rem]">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src={logo} alt="Logo" className="w-full h-12 object-cover" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <User className="w-6 h-6" />
            </Link>
            {account && !isCorrectNetwork && (
              <span className="text-red-500 text-sm font-medium">
                Wrong network - Click to switch
              </span>
            )}
            <button
              onClick={handleWalletClick}
              className={`
                px-4 py-2 rounded-lg font-medium shadow-lg transition-all
                ${
                  isCorrectNetwork
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              `}
            >
              {!account
                ? "Connect Wallet"
                : !isCorrectNetwork
                ? "Switch Network"
                : `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

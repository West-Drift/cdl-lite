import { Globe, Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, href: "https://x.com/acreafrica", label: "Twitter" },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/company/acreafrica",
      label: "LinkedIn",
    },
    { icon: Github, href: "https://acreafrica.com", label: "GitHub" },
    { icon: Globe, href: "https://acreafrica.com", label: "Website" },
  ];

  return (
    <footer className="bg-muted dark:bg-card text-background dark:text-foreground">
      {/* Bottom bar */}
      <div className="border-t border-muted-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              © {currentYear} Acre Africa. All rights reserved.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-muted-foreground dark:text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

# Contributing to MyFace SnapJournal

Thank you for your interest in contributing to MyFace SnapJournal! 🎉

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Rust 1.70+** - [Install via rustup](https://rustup.rs/)
- **Git** - [Download here](https://git-scm.com/)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/myfacesnapjournal.git
   cd myfacesnapjournal
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup-dev.sh
   ./setup-dev.sh
   ```

3. **Start development**
   ```bash
   npm run tauri:dev
   ```

## 🎯 How to Contribute

### 🐛 Bug Reports

- Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include steps to reproduce
- Add screenshots if relevant
- Specify your OS and browser

### ✨ Feature Requests

- Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
- Describe the use case
- Explain how it fits the project vision
- Consider implementation complexity

### 🔧 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Create a Pull Request**

## 📝 Coding Standards

### TypeScript/React
- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable names

### CSS/Styling
- Use Tailwind CSS classes
- Follow the glass morphism design system
- Ensure theme compatibility (light/dark/brutalist)
- Use CSS custom properties when needed

### Git Commit Messages
- Use conventional commits: `type(scope): description`
- Examples:
  - `feat(feed): add like and bookmark functionality`
  - `fix(ui): resolve footer positioning issue`
  - `docs(readme): update installation instructions`

## 🎨 Design Guidelines

### Glass Morphism Theme
- Use `glass-panel` and `glass-subtle` classes
- Maintain consistent border radius (`rounded-lg`, `rounded-2xl`)
- Use `backdrop-blur-xl` for glass effects
- Follow the color palette in `src/styles/theme.css`

### Responsive Design
- Mobile-first approach
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Test on different screen sizes
- Ensure touch-friendly interactions

### Animation Guidelines
- Use `transition-all duration-300 ease-in-out` for smooth animations
- Hover effects: `hover:scale-105` or `hover:bg-white/20`
- Loading states with skeleton screens
- Consistent timing functions

## 🧪 Testing

### Manual Testing
- Test all user flows
- Verify theme switching works
- Check responsive behavior
- Test Mastodon integration

### Automated Testing
- Run linting: `npm run lint`
- Type checking: `npm run type-check`
- Build verification: `npm run build`

## 📚 Project Structure

```
src/
├── components/          # React components
│   ├── Layout/         # Layout components (Sidebar, Footer, etc.)
│   ├── UI/             # Reusable UI components
│   ├── Mastodon/       # Mastodon-specific components
│   └── Facebook/       # Facebook integration components
├── pages/              # Page components
├── services/           # API and business logic
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── styles/             # CSS and theme files
└── utils/              # Utility functions
```

## 🔍 Code Review Process

1. **Automated Checks** - CI/CD runs linting and type checking
2. **Manual Review** - Maintainers review code quality and design
3. **Testing** - Verify functionality works as expected
4. **Documentation** - Ensure changes are properly documented

## 📞 Getting Help

- **GitHub Discussions** - For questions and general discussion
- **GitHub Issues** - For bugs and feature requests
- **Discord** - [Join our community](https://discord.gg/your-invite)

## 🎉 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to the core team (for significant contributions)

Thank you for making MyFace SnapJournal better! 🚀

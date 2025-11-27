echo "Activating git hooks"
pnpm dlx husky install

echo "Building @unovis"
pnpm build:ts
pnpm build:angular
pnpm build:react
pnpm build:svelte
pnpm build:vue
pnpm build:solid

echo "📄 Updating licenses (will be done in the background)"
cd ../../
pnpm gather-licenses > /dev/null 2>&1 &

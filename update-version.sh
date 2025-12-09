echo Enter new version:
read new_version

echo Updating version to $new_version

current_version=$(node -e "console.log(require('./package.json').version)")
pnpm version ${new_version} --workspaces
perl -pi -e "s/\"version\": \"${current_version}\"/\"version\": \"${new_version}\"/g" package.json
perl -pi -e "s/\"\@unovis\/ts\": \"${current_version}\"/\"\@unovis\/ts\": \"${new_version}\"/g" packages/*/package.json
pnpm install --ignore-scripts

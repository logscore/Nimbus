#!/bin/bash

set -euo pipefail

# Create version and publish and push tags based on
# https://github.com/changesets/changesets/blob/c7b6832a7a2783073e720d2085a546810e9b55eb/docs/prereleases.md

# 1 Version the packages
bun run changeset version

# 2 Update lockfile and amend commit
bun update --lockfile-only
git add bun.lock*
message="$(git log -1 --pretty=%B)$(echo -e '\nchore: updating dependencies via bun update --lockfile-only')"
git commit --amend -m "$message"

# 3 Publish the packages
bun run changeset publish

# 4. Get the latest commit with a release message (can adjust grep if needed)
commit_sha=$(git log --grep='RELEASING' --format='%H' -n 1)

# 5. Get all tags on that commit
tags=$(git tag --points-at "$commit_sha")

# 6. Extract specific versions
server_version=""
web_version=""

repo=@nimbus
repo_server_pattern="${repo}/server@"
repo_web_pattern="${repo}/web@"

for tag in $tags; do
  if [[ "$tag" == "$repo_server_pattern"* ]]; then
    server_version="${tag#*@}"
  elif [[ "$tag" == "$repo_web_pattern"* ]]; then
    web_version="${tag#*@}"
  fi
done

# 7. Construct branch name
branch_prefix="release"
if [[ "$server_version" && "$web_version" ]]; then
  branch="$branch_prefix/$server_version+$web_version"
elif [[ "$server_version" ]]; then
  branch="$branch_prefix/$server_version"
elif [[ "$web_version" ]]; then
  branch="$branch_prefix/$web_version"
else
  echo "❌ Could not find either tag by pattern $repo_server_pattern or $repo_web_pattern on commit $commit_sha"
  exit 1
fi

# 8. Push to origin
git push

# 9. Create the branch from the commit
git switch -c "$branch" "$commit_sha"

# 10. Push to origin
git push origin "$branch" --follow-tags

echo ""
echo "✅ Created release. Branch: $branch. Tags: $tags"

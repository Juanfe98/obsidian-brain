#!/usr/bin/env python3
"""
Get the diff between current branch and main/master branch.
Usage: python get_branch_diff.py [--base <branch>] [--stat] [--commits] [--all]
"""

import subprocess
import argparse
import sys


def get_default_branch():
    """Detect the default branch (main or master)."""
    try:
        # Try to get the default branch from remote
        result = subprocess.run(
            ['git', 'symbolic-ref', 'refs/remotes/origin/HEAD'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            # refs/remotes/origin/main -> main
            return result.stdout.strip().split('/')[-1]
    except Exception:
        pass

    # Fallback: check if main or master exists
    for branch in ['main', 'master']:
        result = subprocess.run(
            ['git', 'rev-parse', '--verify', branch],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return branch

    return 'main'  # Default fallback


def get_current_branch():
    """Get the current branch name."""
    result = subprocess.run(
        ['git', 'branch', '--show-current'],
        capture_output=True,
        text=True,
        check=True
    )
    return result.stdout.strip()


def get_merge_base(base_branch):
    """Get the merge base between current branch and base branch."""
    result = subprocess.run(
        ['git', 'merge-base', base_branch, 'HEAD'],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        return base_branch
    return result.stdout.strip()


def get_diff_stat(merge_base):
    """Get diff stat summary."""
    result = subprocess.run(
        ['git', 'diff', merge_base, '--stat'],
        capture_output=True,
        text=True,
        check=True
    )
    return result.stdout


def get_branch_diff(merge_base):
    """Get the full diff."""
    result = subprocess.run(
        ['git', 'diff', merge_base],
        capture_output=True,
        text=True,
        check=True
    )
    return result.stdout


def get_commit_messages(merge_base):
    """Get commit messages from current branch since diverging from base."""
    result = subprocess.run(
        ['git', 'log', f'{merge_base}..HEAD', '--pretty=format:%s%n%b---'],
        capture_output=True,
        text=True
    )
    return result.stdout


def get_changed_files_count(merge_base):
    """Get count of changed files."""
    result = subprocess.run(
        ['git', 'diff', merge_base, '--name-only'],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        return 0
    files = [f for f in result.stdout.strip().split('\n') if f]
    return len(files)


def get_lines_changed(merge_base):
    """Get total lines added/removed."""
    result = subprocess.run(
        ['git', 'diff', merge_base, '--shortstat'],
        capture_output=True,
        text=True
    )
    return result.stdout.strip()


def main():
    parser = argparse.ArgumentParser(
        description='Get diff between current branch and base branch'
    )
    parser.add_argument(
        '--base',
        help='Base branch to compare against (default: auto-detect main/master)'
    )
    parser.add_argument(
        '--stat',
        action='store_true',
        help='Show only stat summary'
    )
    parser.add_argument(
        '--commits',
        action='store_true',
        help='Show commit messages instead of diff'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Show stat, commits, and full diff together'
    )

    args = parser.parse_args()

    base_branch = args.base or get_default_branch()
    current_branch = get_current_branch()
    merge_base = get_merge_base(base_branch)

    # Check for no changes
    files_count = get_changed_files_count(merge_base)
    if files_count == 0:
        print(f"Current branch: {current_branch}", file=sys.stderr)
        print(f"Base branch: {base_branch}", file=sys.stderr)
        print("---", file=sys.stderr)
        print("NO_CHANGES: No differences found between current branch and base branch.")
        sys.exit(0)

    print(f"Current branch: {current_branch}", file=sys.stderr)
    print(f"Base branch: {base_branch}", file=sys.stderr)
    print(f"Files changed: {files_count}", file=sys.stderr)
    print("---", file=sys.stderr)

    if args.all:
        # Combined output for efficiency
        print("## STAT SUMMARY")
        print(get_diff_stat(merge_base))
        print("\n## COMMIT MESSAGES")
        print(get_commit_messages(merge_base))
        print("\n## FULL DIFF")
        diff = get_branch_diff(merge_base)
        # Warn if diff is very large
        lines = diff.count('\n')
        if lines > 2000:
            print(f"[WARNING: Large diff - {lines} lines. Consider focusing on stat and commits.]", file=sys.stderr)
        print(diff)
    elif args.commits:
        print(get_commit_messages(merge_base))
    elif args.stat:
        print(get_diff_stat(merge_base))
    else:
        print(get_branch_diff(merge_base))


if __name__ == '__main__':
    main()

import { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.GITHUB_CLIENT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const code = req.query.code;

    if (!code) {
      // If no code, redirect to GitHub OAuth
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;
      return res.redirect(githubAuthUrl);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user's repositories
    const reposResponse = await fetch('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const repos = await reposResponse.json();
    
    return res.status(200).json({
      repos: repos.map(repo => ({
        id: repo.id,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
      }))
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ message: 'Failed to authenticate with GitHub' });
  }
} 
/**
 * GitHub API utilities for managing blog posts
 * Since Vercel has a read-only filesystem, we use GitHub API to commit files
 */

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Suv00m';
const GITHUB_REPO = process.env.GITHUB_REPO || 'portfolio';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BLOGS_PATH = 'data/blogs';

interface GitHubFile {
  path: string;
  mode: string;
  type: string;
  sha?: string;
  content: string;
}

/**
 * Get the SHA of an existing file (needed for updates)
 */
async function getFileSha(path: string): Promise<string | null> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (response.status === 404) {
      return null; // File doesn't exist yet
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${errorData.message || response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();
    return data.sha;
  } catch (error) {
    console.error('Error getting file SHA:', error);
    return null;
  }
}

/**
 * Create or update a file in GitHub
 */
export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string
): Promise<void> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const fileSha = await getFileSha(path);
  const encodedContent = Buffer.from(content).toString('base64');

  const file: GitHubFile = {
    path,
    mode: '100644',
    type: 'file',
    content: encodedContent,
  };

  if (fileSha) {
    file.sha = fileSha;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: encodedContent,
        sha: fileSha || undefined,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText;
    throw new Error(`GitHub API error: ${errorMessage} (Status: ${response.status}). Make sure your GITHUB_TOKEN has 'repo' scope permissions.`);
  }
}

/**
 * Delete a file from GitHub
 */
export async function deleteFile(path: string, message: string): Promise<void> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const fileSha = await getFileSha(path);
  if (!fileSha) {
    throw new Error('File not found');
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sha: fileSha,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText;
    throw new Error(`GitHub API error: ${errorMessage} (Status: ${response.status}). Make sure your GITHUB_TOKEN has 'repo' scope permissions.`);
  }
}

/**
 * Get all files from a directory in GitHub
 */
export async function getDirectoryFiles(path: string): Promise<string[]> {
  if (!GITHUB_TOKEN) {
    // Fallback to filesystem if no token (for local development)
    const { readdir } = await import('fs/promises');
    const { join } = await import('path');
    const dirPath = join(process.cwd(), path);
    try {
      const files = await readdir(dirPath);
      return files.filter(file => file.endsWith('.json'));
    } catch {
      return [];
    }
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${errorData.message || response.statusText} (Status: ${response.status})`);
    }

    const files = await response.json();
    return files
      .filter((file: any) => file.type === 'file' && file.name.endsWith('.json'))
      .map((file: any) => file.name);
  } catch (error) {
    console.error('Error getting directory files:', error);
    return [];
  }
}

/**
 * Get file content from GitHub
 */
export async function getFileContent(path: string): Promise<string | null> {
  if (!GITHUB_TOKEN) {
    // Fallback to filesystem if no token (for local development)
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const filePath = join(process.cwd(), path);
    try {
      return await readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${errorData.message || response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();
    // GitHub returns base64 encoded content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    console.error('Error getting file content:', error);
    return null;
  }
}

export const BLOGS_DIR_PATH = BLOGS_PATH;

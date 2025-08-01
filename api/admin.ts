
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CoinDetail } from '../types';

// The key for the set of project IDs
const ADMIN_PROJECT_IDS_KEY = 'admin_project_ids';
// The prefix for individual project keys
const PROJECT_KEY_PREFIX = 'project:';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  if (req.method === 'POST') {
    try {
        const { name, symbol, logo, description, website, whitepaper, isHighlighted } = req.body;

        if (!name || !symbol || !logo || !description || !website || !whitepaper) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const newProject: CoinDetail = {
            id: `custom-${symbol.toLowerCase().replace(/\s/g, '-')}`,
            name,
            symbol: symbol.toUpperCase(),
            rank: 0,
            is_new: true,
            is_active: true,
            type: 'coin',
            logo,
            description,
            tags: [{id: 'custom-project', name: 'Custom Project'}],
            links: { website: [website] },
            whitepaper: { link: whitepaper },
        };

        if (isHighlighted) {
            newProject.highlightedUntil = Date.now() + 24 * 60 * 60 * 1000;
        }

        const projectId = newProject.id;
        const projectKey = `${PROJECT_KEY_PREFIX}${projectId}`;

        const isDuplicate = await kv.sismember(ADMIN_PROJECT_IDS_KEY, projectId);
        if (isDuplicate) {
            return res.status(409).json({ error: 'A project with this symbol already exists.' });
        }

        const pipeline = kv.multi();
        pipeline.sadd(ADMIN_PROJECT_IDS_KEY, projectId);
        pipeline.set(projectKey, newProject);
        await pipeline.exec();

        return res.status(201).json(newProject);
    } catch (error) {
        console.error('ADMIN_API_POST_ERROR', { message: (error as Error).message, body: req.body });
        return res.status(500).json({ error: 'Failed to add project.' });
    }
  } 
  else if (req.method === 'GET') {
    try {
      const projectIds = await kv.smembers(ADMIN_PROJECT_IDS_KEY);
      if (!projectIds || projectIds.length === 0) {
        return res.status(200).json([]);
      }
      
      const projectKeys = projectIds.map(id => `${PROJECT_KEY_PREFIX}${id}`);
      if (projectKeys.length === 0) {
        return res.status(200).json([]);
      }
      const projects = await kv.mget<CoinDetail[]>(...projectKeys);

      const validProjects = projects.filter(p => p !== null);

      return res.status(200).json(validProjects);
    } catch (error) {
      console.error('ADMIN_API_GET_ERROR', { message: (error as Error).message });
      return res.status(500).json({ error: 'Failed to retrieve projects.' });
    }
  }
  else if (req.method === 'PUT') {
    try {
        const { projectId, action, projectData } = req.body;

        if (!projectId) {
            return res.status(400).json({ error: 'Missing projectId.' });
        }

        const projectKey = `${PROJECT_KEY_PREFIX}${projectId}`;
        const project = await kv.get<CoinDetail>(projectKey);

        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        let updated = false;

        // Handle highlight/unhighlight action
        if (action) {
            if (action !== 'highlight' && action !== 'unhighlight') {
                return res.status(400).json({ error: 'Invalid action specified.' });
            }
            if (action === 'highlight') {
                project.highlightedUntil = Date.now() + 24 * 60 * 60 * 1000;
            } else { // unhighlight
                delete project.highlightedUntil;
            }
            updated = true;
        } 
        
        // Handle project data update action
        else if (projectData) {
            // Validate and update project fields.
            // We don't allow changing the symbol or ID.
            if (projectData.name) project.name = projectData.name;
            if (projectData.logo) project.logo = projectData.logo;
            if (projectData.description) project.description = projectData.description;
            if (projectData.website) project.links.website = [projectData.website];
            if (projectData.whitepaper) project.whitepaper.link = projectData.whitepaper;
            updated = true;
        }

        if (!updated) {
            return res.status(400).json({ error: 'No valid action or data provided for update.' });
        }

        await kv.set(projectKey, project);
        return res.status(200).json(project);

    } catch (error) {
        console.error('ADMIN_API_PUT_ERROR', { message: (error as Error).message, body: req.body });
        return res.status(500).json({ error: 'Failed to update project.' });
    }
  }
  else if (req.method === 'DELETE') {
      try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({ error: 'Missing projectId.' });
        }

        const projectKey = `${PROJECT_KEY_PREFIX}${projectId}`;
        
        const pipeline = kv.multi();
        pipeline.del(projectKey);
        pipeline.srem(ADMIN_PROJECT_IDS_KEY, projectId);
        await pipeline.exec();

        return res.status(200).json({ message: 'Project deleted successfully.' });

      } catch (error) {
          console.error('ADMIN_API_DELETE_ERROR', { message: (error as Error).message, body: req.body });
          return res.status(500).json({ error: 'Failed to delete project.' });
      }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
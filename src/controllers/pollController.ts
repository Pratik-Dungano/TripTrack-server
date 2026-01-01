import { Request, Response } from 'express';
import Room from '../models/Room';
import Poll from '../models/Poll';
import { geocodeLocations, clusterLocations } from '../services/geo.service';

// Formula weights
const WEIGHTS = { mention: 0.4, sentiment: 0.3, cluster: 0.3 };

export async function generatePoll(req: Request, res: Response) {
  const { roomCode, aiResult } = req.body;
  if (!roomCode || !aiResult) return res.status(400).json({ message: 'roomCode and aiResult required' });
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Handle case where aiResult might be a string (legacy or error case)
    let parsedResult = aiResult;
    if (typeof aiResult === 'string') {
      try {
        // Strip markdown code blocks if present
        const cleaned = aiResult.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedResult = JSON.parse(cleaned);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid aiResult format (expected JSON object)', aiResult });
      }
    }
    
    // Debug log of what we get from Gemini
    console.log("Parsed aiResult:", parsedResult);
    
    const locations = Array.isArray(parsedResult.locations) ? parsedResult.locations : [];
    if (!locations.length) {
      return res.status(400).json({ message: "No valid poll options returned by AI model.", aiResult: parsedResult });
    }
    
    // 1. Geocode all AI locations
    const geoResults = await geocodeLocations(locations.map((l: any) => l.name));
    // 2. Cluster locations
    const clusters = clusterLocations(geoResults);
    // 3. Calculate cluster densities
    const clusterCounts: Record<number, number> = {};
    clusters.forEach((c: number) => { clusterCounts[c] = (clusterCounts[c] || 0) + 1; });
    // 4. Assign AI Score
    const options = locations.map((loc: any, i: number) => {
      const clusterDensity = clusterCounts[clusters[i]] || 1;
      const aiScore = (loc.mentionCount * WEIGHTS.mention) + (loc.sentimentScore * WEIGHTS.sentiment) + (clusterDensity * WEIGHTS.cluster);
      return {
        location: loc.name,
        latitude: geoResults[i].latitude,
        longitude: geoResults[i].longitude,
        aiScore,
        votes: 0,
      };
    });
    // 5. Sort, take Top 4-6 options
    options.sort((a: any, b: any) => b.aiScore - a.aiScore);
    const pollOptions = options.slice(0, 6);
    const poll = new Poll({
      roomId: room._id,
      options: pollOptions,
      aiExplanation: parsedResult.overallInsights || '',
    });
    await poll.save();
    res.status(201).json({ poll });
  } catch (err) {
    console.error("Poll generation error:", err);
    res.status(500).json({ message: 'Poll generation failed', error: err });
  }
}

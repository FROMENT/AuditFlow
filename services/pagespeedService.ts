import { PageSpeedMetrics } from '../types';

/**
 * Fetches PageSpeed Insights metrics for a given URL.
 */
export const fetchPageSpeedMetrics = async (url: string): Promise<PageSpeedMetrics> => {
  try {
    // Ensure URL has a protocol
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Using the public PageSpeed Insights API
    const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY;
    const apiKeyParam = apiKey ? `&key=${apiKey}` : '';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&strategy=mobile${apiKeyParam}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('QUOTA_EXCEEDED');
      }
      
      const errorText = await response.text();
      console.error('PageSpeed API Error:', response.status, errorText);
      throw new Error(`Failed to fetch PageSpeed metrics: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    
    return {
      performance: Math.round(lighthouse.categories.performance.score * 100),
      accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
      bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
      seo: Math.round(lighthouse.categories.seo.score * 100),
    };
  } catch (error) {
    if (error instanceof Error && error.message !== 'QUOTA_EXCEEDED') {
      console.error('Error fetching PageSpeed metrics:', error);
    }
    throw error;
  }
};

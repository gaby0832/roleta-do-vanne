// lib/rate-limit.ts

interface RateLimitData {
  count: number;
  firstRequest: number;
}

// O Map fica aqui, fora da função, para persistir entre chamadas (apenas em servidor Node único)
const requests = new Map<string, RateLimitData>();

export function checkRateLimit(ip: string, limit: number, interval: number): { success: boolean; remaining: number } {
  const now = Date.now();
  
  if (!requests.has(ip)) {
    requests.set(ip, { count: 0, firstRequest: now });
  }


  const data = requests.get(ip)!;

  // Reset se passou do intervalo
  if (now - data.firstRequest > interval) {
    data.count = 0;
    data.firstRequest = now;
  }

  data.count += 1;
  requests.set(ip, data);

  if (data.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - data.count };
}   
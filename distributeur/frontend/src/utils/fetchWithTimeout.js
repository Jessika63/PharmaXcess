export default function fetchWithTimeout(resource, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
} 
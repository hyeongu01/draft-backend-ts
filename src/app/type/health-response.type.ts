export type HealthResponseType = {
  status: string;
  host: string;
  uptime: `${number}h ${number}m ${number}s`;
};

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  authenticated: boolean;
}
export interface AppSettings {
  id: string;
  app_type: string;
  button_text_color: string | null;
  global_logo: string | null;
  splash_screen: string | null;
  maintenance_message_image: string | null;
  promotional_banner: string | null;
  is_maintenance_mode: boolean;
  maintenance_message: string;
  primary_color: string | null;
  secondary_color: string | null;
  tertiary_color: string | null;
  created_at: string;
  updated_at: string;
}

-- Supabase Database Schema for PresskitGen

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Press kits table
CREATE TABLE IF NOT EXISTS public.press_kits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Basic Information
  game_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  release_date DATE,
  platforms TEXT[] DEFAULT '{}',
  website_url TEXT,
  
  -- Template & Customization
  template_id TEXT DEFAULT 'default' NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  custom_domain TEXT UNIQUE,
  
  -- Metadata
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Press kit assets (images, videos, files)
CREATE TABLE IF NOT EXISTS public.press_kit_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  press_kit_id UUID REFERENCES public.press_kits(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('logo', 'header', 'screenshot', 'trailer', 'other')),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Press kit links (Steam, itch.io, social media, etc.)
CREATE TABLE IF NOT EXISTS public.press_kit_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  press_kit_id UUID REFERENCES public.press_kits(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('steam', 'itch', 'epic', 'gog', 'twitter', 'youtube', 'discord', 'other')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Contact information
CREATE TABLE IF NOT EXISTS public.press_kit_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  press_kit_id UUID REFERENCES public.press_kits(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Templates (predefined designs)
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  price INTEGER DEFAULT 0, -- in cents
  preview_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Purchases (template purchases)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT REFERENCES public.templates(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Subscriptions (for custom domains, analytics, etc.)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  plan_type TEXT CHECK (plan_type IN ('custom_domain', 'analytics')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Analytics events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  press_kit_id UUID REFERENCES public.press_kits(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download', 'asset_download')),
  asset_id UUID REFERENCES public.press_kit_assets(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_press_kits_user_id ON public.press_kits(user_id);
CREATE INDEX IF NOT EXISTS idx_press_kits_slug ON public.press_kits(slug);
CREATE INDEX IF NOT EXISTS idx_press_kits_is_published ON public.press_kits(is_published);
CREATE INDEX IF NOT EXISTS idx_press_kit_assets_press_kit_id ON public.press_kit_assets(press_kit_id);
CREATE INDEX IF NOT EXISTS idx_press_kit_links_press_kit_id ON public.press_kit_links(press_kit_id);
CREATE INDEX IF NOT EXISTS idx_press_kit_contacts_press_kit_id ON public.press_kit_contacts(press_kit_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_press_kit_id ON public.analytics_events(press_kit_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_kit_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_kit_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_kit_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Press kits policies
CREATE POLICY "Anyone can view published press kits" ON public.press_kits FOR SELECT USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own press kits" ON public.press_kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own press kits" ON public.press_kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own press kits" ON public.press_kits FOR DELETE USING (auth.uid() = user_id);

-- Press kit assets policies
CREATE POLICY "Anyone can view assets of published press kits" ON public.press_kit_assets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_assets.press_kit_id AND (is_published = true OR user_id = auth.uid()))
);
CREATE POLICY "Users can insert assets for their own press kits" ON public.press_kit_assets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_assets.press_kit_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update assets of their own press kits" ON public.press_kit_assets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_assets.press_kit_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete assets of their own press kits" ON public.press_kit_assets FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_assets.press_kit_id AND user_id = auth.uid())
);

-- Press kit links policies (same pattern as assets)
CREATE POLICY "Anyone can view links of published press kits" ON public.press_kit_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_links.press_kit_id AND (is_published = true OR user_id = auth.uid()))
);
CREATE POLICY "Users can manage links for their own press kits" ON public.press_kit_links FOR ALL USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_links.press_kit_id AND user_id = auth.uid())
);

-- Press kit contacts policies (same pattern)
CREATE POLICY "Anyone can view contacts of published press kits" ON public.press_kit_contacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_contacts.press_kit_id AND (is_published = true OR user_id = auth.uid()))
);
CREATE POLICY "Users can manage contacts for their own press kits" ON public.press_kit_contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = press_kit_contacts.press_kit_id AND user_id = auth.uid())
);

-- Templates policies
CREATE POLICY "Anyone can view active templates" ON public.templates FOR SELECT USING (is_active = true);

-- Purchases policies
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Service role can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view analytics for their own kits" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.press_kits WHERE id = analytics_events.press_kit_id AND user_id = auth.uid())
);

-- Insert default templates
INSERT INTO public.templates (id, name, description, is_premium, price, is_active) VALUES
  ('default', 'Classic', 'Clean and professional press kit design inspired by presskit()', false, 0, true),
  ('modern', 'Modern Dark', 'Contemporary dark theme with smooth animations', true, 900, true),
  ('vibrant', 'Vibrant Colors', 'Eye-catching colorful design with bold typography', true, 900, true),
  ('minimal', 'Minimalist', 'Ultra-clean minimalist design with maximum readability', true, 900, true)
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_press_kits_updated_at BEFORE UPDATE ON public.press_kits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets (run these in Supabase dashboard or via SQL editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('press-kit-assets', 'press-kit-assets', true) ON CONFLICT DO NOTHING;

-- Storage policies
-- CREATE POLICY "Public assets are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'press-kit-assets');
-- CREATE POLICY "Authenticated users can upload assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'press-kit-assets' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own assets" ON storage.objects FOR UPDATE USING (bucket_id = 'press-kit-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own assets" ON storage.objects FOR DELETE USING (bucket_id = 'press-kit-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

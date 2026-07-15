-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    image TEXT NOT NULL,
    show_before_after BOOLEAN DEFAULT FALSE,
    before_image TEXT,
    after_image TEXT,
    standalone_image TEXT,
    short_desc TEXT NOT NULL,
    listing_desc TEXT NOT NULL,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    hero_summary TEXT NOT NULL,
    what_is TEXT NOT NULL,
    who_benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    before_care JSONB NOT NULL DEFAULT '[]'::jsonb,
    after_care JSONB NOT NULL DEFAULT '[]'::jsonb,
    faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
    related_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT TRUE,
    kb_article_id UUID REFERENCES public.knowledge_base(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on published services"
    ON public.services FOR SELECT
    USING (is_published = TRUE);

CREATE POLICY "Allow admin full access to services"
    ON public.services FOR ALL
    USING (
        auth.role() = 'authenticated' AND 
        (auth.jwt() ->> 'role' = 'ADMIN' OR auth.jwt() ->> 'role' = 'SUPER_ADMIN')
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_services_updated_at();

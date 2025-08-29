-- Create table for Wednesday class RSVPs
CREATE TABLE IF NOT EXISTS public.wednesday_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  week_of DATE NOT NULL DEFAULT DATE_TRUNC('week', NOW() AT TIME ZONE 'Africa/Johannesburg')::DATE
);

-- Create index for efficient querying by week
CREATE INDEX IF NOT EXISTS idx_wednesday_rsvps_week_of ON public.wednesday_rsvps(week_of);

-- Create index for efficient querying by creation time
CREATE INDEX IF NOT EXISTS idx_wednesday_rsvps_created_at ON public.wednesday_rsvps(created_at);

-- Enable RLS (though this table doesn't need user-specific policies since it's public RSVPs)
ALTER TABLE public.wednesday_rsvps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert RSVPs (public registration)
CREATE POLICY "Allow public RSVP insertion" ON public.wednesday_rsvps
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read RSVPs (for admin purposes)
CREATE POLICY "Allow public RSVP reading" ON public.wednesday_rsvps
  FOR SELECT USING (true);

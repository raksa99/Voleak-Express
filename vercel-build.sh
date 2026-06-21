#!/bin/bash
# Exit on error
set -e

echo "Starting Vercel Build Script for Flutter Web..."

# 1. Generate the .env file from environment variables if running in Vercel
if [ "$VERCEL" = "1" ]; then
  echo "Vercel environment detected. Generating .env file..."
  echo "supabaseUrl=${SUPABASE_URL:-$supabaseUrl}" > .env
  echo "supabaseAnonKey=${SUPABASE_ANON_KEY:-$supabaseAnonKey}" >> .env
  echo ".env file generated successfully."
fi

# 2. Clone Flutter SDK if it doesn't exist
if [ ! -d "flutter" ]; then
  echo "Cloning Flutter SDK (stable branch, shallow clone)..."
  git clone --depth 1 -b stable https://github.com/flutter/flutter.git
else
  echo "Flutter SDK already exists. Pulling latest stable changes..."
  cd flutter
  git pull
  cd ..
fi

# 3. Add Flutter to local PATH
export PATH="$PATH:$(pwd)/flutter/bin"

# 4. Verify Flutter installation
flutter doctor

# 5. Enable Web building
flutter config --enable-web

# 6. Fetch Flutter packages
flutter pub get

# 7. Generate localization files (AppLocalizations)
flutter gen-l10n

# 8. Build the application for web release
flutter build web --release

echo "Vercel Build Script completed successfully."

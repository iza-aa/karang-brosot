"use client";

// app/test/page.tsx
import { useState } from "react";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ButtonAction from "@/components/ui/button-action";

export default function TestPage() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl space-y-3">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Component Testing Ground
        </h1>

        {/* Test ButtonAction */}
        <Card variant="regular" className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Button Action Test</CardTitle>
                <CardDescription>Toggle visibility dan edit button</CardDescription>
              </div>
              <ButtonAction
                isVisible={isVisible}
                onEdit={() => alert('Edit clicked!')}
                onToggleVisibility={() => setIsVisible(!isVisible)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Status: {isVisible ? 'Visible' : 'Hidden'}
            </p>
          </CardContent>
        </Card>

        {/* Test All Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
          
          {/* Ultra Thin */}
          <Card variant="ultraThin">
            <CardHeader>
              <CardTitle>Ultra Thin</CardTitle>
              <CardDescription>Paling ringan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Blur 20px - seperti Control Center iOS
              </p>
            </CardContent>
          </Card>

          {/* Thin */}
          <Card variant="thin" hover>
            <CardHeader>
              <CardTitle>Thin</CardTitle>
              <CardDescription>Blur sedang</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Blur 30px - dengan hover effect
              </p>
            </CardContent>
          </Card>

          {/* Regular */}
          <Card variant="regular">
            <CardHeader>
              <CardTitle>Regular</CardTitle>
              <CardDescription>Default iOS</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Blur 40px - widget iOS standard
              </p>
            </CardContent>
          </Card>

          {/* Thick */}
          <Card variant="thick" hover>
            <CardHeader>
              <CardTitle>Thick</CardTitle>
              <CardDescription>Blur kuat</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Blur 60px - lebih solid
              </p>
            </CardContent>
          </Card>

          {/* Chrome */}
          <Card variant="chrome">
            <CardHeader>
              <CardTitle>Chrome</CardTitle>
              <CardDescription>Paling tebal</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Blur 80px - notifikasi iOS
              </p>
            </CardContent>
          </Card>

          {/* Custom dengan Footer */}
          <Card variant="regular" hover padding="lg">
            <CardHeader>
              <CardTitle>Dengan Footer</CardTitle>
              <CardDescription>Complete card</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Card dengan semua komponen
              </p>
            </CardContent>
            <CardFooter>
              <button className="text-blue-600 text-sm font-medium">
                Action →
              </button>
            </CardFooter>
          </Card>
        </div>

        {/* Test Card dengan Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3">
          <Card variant="regular" hover className="overflow-visible">
            <div className="relative w-full h-48 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-red-500">
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                Image Placeholder
              </div>
            </div>
            <CardHeader>
              <CardTitle>News Card</CardTitle>
              <CardDescription>2 jam yang lalu</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Ini contoh card untuk berita dengan gambar di atas
              </p>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card variant="thin" className="text-center" hover>
            <div className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              1,234
            </div>
            <CardTitle>Total Penduduk</CardTitle>
            <CardDescription>Data tahun 2026</CardDescription>
          </Card>
        </div>

        {/* Test Different Paddings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="regular" padding="sm">
            <CardTitle>Small Padding</CardTitle>
            <CardDescription>Padding compact</CardDescription>
          </Card>

          <Card variant="regular" padding="md">
            <CardTitle>Medium Padding</CardTitle>
            <CardDescription>Padding default</CardDescription>
          </Card>

          <Card variant="regular" padding="lg">
            <CardTitle>Large Padding</CardTitle>
            <CardDescription>Padding lebar</CardDescription>
          </Card>

        </div>
      </div>
  );
}

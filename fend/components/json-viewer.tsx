"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JsonViewer({
  title,
  content,
}: {
  title: string;
  content: object;
}) {
  return (
    <Card className="w-full max-w-xl shadow-md mt-5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60 dark:bg-gray-800">
          <pre className="text-xs">{JSON.stringify(content, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  );
}

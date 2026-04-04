<?php

namespace App\Services;

use Smalot\PdfParser\Parser;

class FileParserService
{
    /**
     * Extract text from uploaded file
     * (matches Flask utils.extract_text_from_pdf())
     */
    public function extractText($file): string
    {
        $extension = $file->getClientOriginalExtension();

        if ($extension === 'txt') {
            return file_get_contents($file->getRealPath());
        }

        if ($extension === 'pdf') {
            return $this->extractFromPdf($file);
        }

        throw new \Exception('Unsupported file type');
    }

    /**
     * Extract text from PDF
     * (matches your PyPDF2 logic)
     */
    private function extractFromPdf($file): string
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($file->getRealPath());
        $text = $pdf->getText();

        if (empty(trim($text))) {
            throw new \Exception('Could not extract text from PDF. The file may be empty or image-based.');
        }

        return trim($text);
    }
}
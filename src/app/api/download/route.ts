import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DownloadHelper } from '../../../lib/utils/download-helper';
import puppeteer from 'puppeteer';

/**
 * Endpoint API pour le téléchargement des visuels
 * @param req Requête entrante
 * @returns Réponse avec le fichier à télécharger
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, type, filename } = body;
    
    if (!content || !type || !filename) {
      return NextResponse.json(
        { error: 'Paramètres manquants: content, type, filename requis' },
        { status: 400 }
      );
    }
    
    if (!['pdf', 'docx'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de document non supporté. Utilisez "pdf" ou "docx"' },
        { status: 400 }
      );
    }
    
    try {
      if (type === 'pdf') {
        const pdfBuffer = await generatePDF(content);
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache'
          }
        });
      } else if (type === 'docx') {
        const docxBuffer = await generateDOCX(content);
        return new NextResponse(docxBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache'
          }
        });
      }
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Error generating ${type}:`, error);
      return NextResponse.json(
        { error: `Erreur lors de la génération du ${type.toUpperCase()}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`❌ [DOWNLOAD] Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Récupérer le nom du fichier depuis les paramètres de requête
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');
    
    // Vérifier que le nom du fichier est valide
    if (!filename) {
      return NextResponse.json(
        { error: 'Nom de fichier manquant' },
        { status: 400 }
      );
    }
    
    try {
      // Récupérer le chemin complet du fichier
      const filePath = DownloadHelper.getFilePath(filename);
      
      // Lire le fichier
      const fileBuffer = fs.readFileSync(filePath);
      
      // Déterminer le type MIME
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.json':
          contentType = 'application/json';
          break;
      }
      
      // Construire le nom de fichier pour le téléchargement
      const downloadFilename = filename.replace(/^visual_\d+_\d+_/, 'studio-evento-visual_');
      
      // Retourner le fichier
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${downloadFilename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Error serving file:`, error);
      return NextResponse.json(
        { error: 'Fichier non trouvé ou inaccessible' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(`❌ [DOWNLOAD] Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function generatePDF(htmlContent: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Template HTML pour le PDF
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cahier des Charges - Studio Evento</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h2 {
                color: #1a73e8;
                border-bottom: 2px solid #e8eaed;
                padding-bottom: 10px;
                margin-top: 30px;
            }
            h3 {
                color: #1a73e8;
                margin-top: 25px;
            }
            h4 {
                color: #5f6368;
                margin-top: 20px;
            }
            ul, ol {
                margin: 15px 0;
                padding-left: 25px;
            }
            li {
                margin: 8px 0;
            }
            p {
                margin: 15px 0;
            }
            strong {
                color: #1a73e8;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #1a73e8;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #1a73e8;
                font-size: 28px;
                margin: 0;
            }
            .footer {
                text-align: center;
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #e8eaed;
                color: #5f6368;
                font-size: 12px;
            }
            @media print {
                body { margin: 0; }
                .header, .footer { break-inside: avoid; }
                h2, h3, h4 { break-after: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>CAHIER DES CHARGES</h1>
            <p>Généré par Studio Evento - ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        ${htmlContent}
        <div class="footer">
            <p>Document généré par Studio Evento - La solution IA pour vos événements</p>
            <p>Date de génération : ${new Date().toLocaleString('fr-FR')}</p>
        </div>
    </body>
    </html>`;
    
    await page.setContent(htmlTemplate);
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

async function generateDOCX(htmlContent: string): Promise<Buffer> {
  // Conversion basique HTML vers format texte pour DOCX
  // Pour une vraie conversion DOCX, il faudrait utiliser une librairie comme mammoth ou docx
  
  // Nettoyer le HTML et extraire le texte
  const textContent = htmlContent
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n\n$1\n' + '='.repeat(50) + '\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n\n$1\n' + '-'.repeat(30) + '\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/g, '\n\n$1:\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/g, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/g, '$1')
    .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n')
    .replace(/<ul[^>]*>|<\/ul>/g, '')
    .replace(/<ol[^>]*>|<\/ol>/g, '')
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\n\n+/g, '\n\n')
    .trim();

  const finalContent = `CAHIER DES CHARGES
${'='.repeat(50)}

Généré par Studio Evento - ${new Date().toLocaleDateString('fr-FR')}

${textContent}

${'='.repeat(50)}
Document généré par Studio Evento
Date de génération : ${new Date().toLocaleString('fr-FR')}`;

  // Pour cette version basique, on retourne un fichier texte avec extension .docx
  // En production, utiliser une vraie librairie DOCX
  return Buffer.from(finalContent, 'utf-8');
}


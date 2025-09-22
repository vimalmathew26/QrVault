// lib/actions.ts
'use server';

import { z } from 'zod';
import connectToDB from './db';
import GeneratedCode from './models/GeneratedCode';
import ScannedCode from './models/ScannedCode';
import { revalidatePath } from 'next/cache';

// Define a schema for input validation using Zod
const CreateCodeSchema = z.object({
  data: z.string().min(1, { message: 'URL or text is required.' }),
  label: z.string().optional(),
  foregroundColor: z.string().regex(/^#[0-9a-f]{6}$/i, { message: 'Invalid color format.' }),
  backgroundColor: z.string().regex(/^#[0-9a-f]{6}$/i, { message: 'Invalid color format.' }),
});

// Define the type for our action's state
export type CreateFormState = {
  error?: {
    data?: string[];
    label?: string[];
    foregroundColor?: string[];
    backgroundColor?: string[];
    db?: string; // For database errors
  } | string;
  success: boolean;
  message: string;
}

// CORRECTED ACTION SIGNATURE: It accepts previousState and formData
export async function createGeneratedCode(
  prevState: CreateFormState, 
  formData: FormData
): Promise<CreateFormState> {
  const validatedFields = CreateCodeSchema.safeParse({
    data: formData.get('data'),
    label: formData.get('label'),
    foregroundColor: formData.get('foregroundColor'),
    backgroundColor: formData.get('backgroundColor'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      success: false,
      message: 'Validation failed.',
    };
  }
  
  try {
    await connectToDB();

    const newCode = new GeneratedCode(validatedFields.data);
    await newCode.save();

    revalidatePath('/');

    return { success: true, message: 'QR Code created successfully!' };
  } catch (error) {
    console.error('Database Error:', error);
    return { 
        error: 'Failed to save QR code to the database.',
        success: false,
        message: 'Database error.',
    };
  }
}

export type ScanFormState = {
  error?: string;
  success: boolean;
  message: string;
}

const ScanCodeSchema = z.object({
  data: z.string().min(1, { message: 'Scanned data cannot be empty.' }),
  note: z.string().optional(),
});

export async function createScannedCode(
  prevState: ScanFormState,
  formData: FormData
): Promise<ScanFormState> {
  const validatedFields = ScanCodeSchema.safeParse({
    data: formData.get('data'),
    note: formData.get('note'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.data?.[0] || 'Invalid data.',
      success: false,
      message: 'Validation failed.',
    };
  }

  try {
    await connectToDB();
    const newScan = new ScannedCode(validatedFields.data);
    await newScan.save();

    revalidatePath('/');
    return { success: true, message: 'Scan saved to history!' };

  } catch (error) {
    console.error('Database Error:', error);
    return {
      error: 'Failed to save scan to the database.',
      success: false,
      message: 'Database error.',
    };
  }
}

export async function updateGeneratedCodeLabel(id: string, newLabel: string) {
  try {
    await connectToDB();
    await GeneratedCode.findByIdAndUpdate(id, { label: newLabel });
    revalidatePath('/'); // Refresh the page data
    return { success: true, message: 'Label updated successfully!' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to update label.' };
  }
}

// Action to update a Scanned Code's note
export async function updateScannedCodeNote(id: string, newNote: string) {
  try {
    await connectToDB();
    await ScannedCode.findByIdAndUpdate(id, { note: newNote });
    revalidatePath('/'); // Refresh the page data
    return { success: true, message: 'Note updated successfully!' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to update note.' };
  }
}
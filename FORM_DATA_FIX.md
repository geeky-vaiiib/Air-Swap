# Form Data Issue Fixed - Multi-Step Claim Form

## Problem Identified

The form data was not being sent properly when submitting the claim. Here's what was wrong:

### Root Cause

The form was using a **dynamic Zod resolver** that changed based on the current step:

```typescript
// BEFORE (BROKEN):
resolver: zodResolver(stepSchemas[currentStep as keyof typeof stepSchemas])
```

**Why this broke the form:**

1. **Step 5 had an empty schema**: `z.object({})` - This meant NO fields were being validated or captured
2. **React Hook Form only validates against the active schema**: When on step 5 (review), it didn't know about fields from steps 1-4
3. **Form data was being ignored**: The resolver would discard any data not in the current step's schema
4. **Submission failed silently**: The `onSubmit` received incomplete or empty data

## Solution Implemented

### 1. Removed Dynamic Resolver
Changed from dynamic resolver to manual validation:

```typescript
// AFTER (FIXED):
const formMethods = useForm<ClaimFormData>({
  mode: 'onChange',
  defaultValues: {
    consent: false,
    evidence: [],
  },
  // No resolver - form now captures ALL fields
});
```

### 2. Added Manual Step Validation
Implemented manual Zod validation in `nextStep()`:

```typescript
const nextStep = async () => {
  const currentValues = getValues(); // Get ALL form data
  
  try {
    // Validate only current step's fields
    switch (currentStep) {
      case 1:
        stepSchemas[1].parse({
          fullName: currentValues.fullName,
          email: currentValues.email,
          phone: currentValues.phone,
        });
        break;
      // ... other steps
    }
    
    setCurrentStep(currentStep + 1);
  } catch (error) {
    if (error instanceof z.ZodError) {
      toast.error(error.errors[0].message);
    }
  }
};
```

### 3. Enhanced onSubmit with Validation & Debugging
Added comprehensive validation and debugging:

```typescript
const onSubmit = async (data: ClaimFormData) => {
  console.log('=== FORM SUBMISSION DEBUG ===');
  console.log('Raw form data received:', data);
  
  // Validate we have all required data
  if (!data.fullName || !data.email) {
    toast.error('Missing required contributor information');
    setCurrentStep(1);
    return;
  }
  
  if (!data.polygon || !data.polygon.coordinates) {
    toast.error('Missing land polygon');
    setCurrentStep(2);
    return;
  }
  
  // ... more validation
  
  // Submit to API
  const claimData = prepareClaimData(data);
  const response = await fetch('/api/claims/index-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData),
  });
  
  // ... handle response
};
```

### 4. Complete Form Schema for Final Validation
Created a complete schema that validates ALL fields:

```typescript
const completeFormSchema = z.object({
  // Step 1 fields
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  
  // Step 2 fields
  country: z.string().min(2),
  polygon: z.object({...}),
  
  // Step 3 fields
  evidence: z.array(...).min(1),
  
  // Step 4 fields
  description: z.string().min(20),
  areaHectares: z.number().min(0.01),
  consent: z.boolean().refine(val => val === true),
});

// Step 5 now uses the complete schema
const stepSchemas = {
  1: z.object({...}),
  2: z.object({...}),
  3: z.object({...}),
  4: z.object({...}),
  5: completeFormSchema // Validates everything!
};
```

## How It Works Now

### Step-by-Step Flow:

1. **User fills Step 1** (Name, Email, Phone)
   - Data stored in form state ✓
   - Click "Next" → Manual validation with `stepSchemas[1]` ✓
   - Move to Step 2 ✓

2. **User fills Step 2** (Location, Map)
   - Step 1 data is PRESERVED ✓
   - Step 2 data stored in form state ✓
   - Click "Next" → Manual validation with `stepSchemas[2]` ✓
   - Move to Step 3 ✓

3. **User fills Step 3** (Evidence Upload)
   - Steps 1-2 data PRESERVED ✓
   - Step 3 data stored ✓
   - Click "Next" → Validation ✓
   - Move to Step 4 ✓

4. **User fills Step 4** (Metadata, Consent)
   - Steps 1-3 data PRESERVED ✓
   - Step 4 data stored ✓
   - Click "Next" → Validation ✓
   - Move to Step 5 (Review) ✓

5. **User reviews on Step 5**
   - ALL data from steps 1-4 is visible ✓
   - Click "Submit Claim" ✓
   - `onSubmit` receives COMPLETE data object ✓
   - Additional validation checks all required fields ✓
   - Data sent to API ✓

## Testing the Fix

### Open Browser Console
You should now see detailed logs when submitting:

```
=== FORM SUBMISSION DEBUG ===
Raw form data received: {
  fullName: "John Doe",
  email: "john@example.com",
  country: "India",
  polygon: { type: "Polygon", coordinates: [[...]] },
  evidence: [ {name: "file.jpg", ...} ],
  description: "My land restoration project...",
  areaHectares: 2.5,
  consent: true
}
Full Name: John Doe
Email: john@example.com
Polygon: {type: "Polygon", coordinates: [[...]]}
Evidence count: 3
Area: 2.5
Consent: true
```

### Validation Errors
If any required data is missing, you'll see:
- Toast notification with specific error
- Console logs showing what's missing
- Form automatically goes back to the step with missing data

### API Submission
```
Prepared claim data: {...}
Response status: 201
Response data: {success: true, data: {...}}
```

## What Changed in Files

### `/pages/dashboard/claims/create.tsx`

**Lines ~17**: Removed `zodResolver` import (no longer needed)

**Lines ~47-105**: Added `completeFormSchema` and updated `stepSchemas[5]` to use it

**Lines ~143**: Removed resolver from `useForm()` config

**Lines ~153**: Removed unused `trigger` and `errors` from destructuring

**Lines ~166-228**: Completely rewrote `nextStep()` to use manual Zod validation

**Lines ~570-633**: Enhanced `onSubmit()` with:
- Detailed console logging
- Pre-submission validation
- Step-specific error navigation
- Better error messages

## Benefits of This Fix

✅ **All form data preserved across steps** - No more lost data  
✅ **Proper step-by-step validation** - Each step validates only its fields  
✅ **Complete validation on submit** - Final check ensures nothing is missing  
✅ **Better debugging** - Extensive console logs show exactly what's being sent  
✅ **User-friendly errors** - Specific messages tell users what's wrong  
✅ **Auto-navigation to error step** - Form takes user back to incomplete step  

## Testing Checklist

- [ ] Fill out all 5 steps
- [ ] Check browser console for debug logs
- [ ] Verify data appears correctly on Step 5 (Review)
- [ ] Submit the form
- [ ] Check console for "FORM SUBMISSION DEBUG" logs
- [ ] Verify API receives correct data structure
- [ ] Test validation by leaving fields empty
- [ ] Confirm error messages appear properly

## Common Issues & Solutions

### Issue: "Missing required contributor information"
**Solution**: Go back to Step 1 and fill in Name and Email

### Issue: "Missing land polygon"
**Solution**: Go back to Step 2 and draw polygon on map

### Issue: "Missing evidence files"
**Solution**: Go back to Step 3 and upload at least one file

### Issue: Form still not submitting
**Check**:
1. Open browser console (F12)
2. Look for debug logs showing form data
3. Check if any validation errors appear
4. Verify MongoDB is connected (not paused)

## Next Steps

If form is still not working:
1. Check browser console for errors
2. Share the debug logs from submission
3. Verify MongoDB connection: `node scripts/test-mongodb.js`
4. Check if demo mode is enabled in `.env.local`

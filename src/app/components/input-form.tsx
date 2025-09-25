"use client";

import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Euro, Percent, Trash2 } from 'lucide-react';
import type { AnalysisFormValues } from '@/lib/schema';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface InputFormProps {
  form: UseFormReturn<AnalysisFormValues>;
  onValuesChange: (values: AnalysisFormValues) => void;
  onClear: () => void;
}

const LabelWithTooltip = ({ label, tooltip }: { label: string, tooltip: string }) => (
  <div className="flex items-center gap-1.5">
    <FormLabel>{label}</FormLabel>
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger type="button">
          <Info className="w-4 h-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

export default function InputForm({ form, onValuesChange, onClear }: InputFormProps) {
  useEffect(() => {
    const subscription = form.watch((value) => {
      onValuesChange(value as AnalysisFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, onValuesChange]);

  const transform = {
    input: (value: any) => (value === 0 && form.getFieldState(value).isDirty ? 0 : value || ''),
    output: (e: React.ChangeEvent<HTMLInputElement>) => {
      const output = parseInt(e.target.value, 10);
      return isNaN(output) ? undefined : output;
    },
  };

  const transformFloat = {
    input: (value: any) => (value === 0 && form.getFieldState(value).isDirty ? 0 : value || ''),
    output: (e: React.ChangeEvent<HTMLInputElement>) => {
      const output = parseFloat(e.target.value);
      return isNaN(output) ? undefined : output;
    },
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Input Wizard</CardTitle>
        <CardDescription>Enter your details to start the analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary">Personal & Financials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} onChange={e => field.onChange(transform.output(e))} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="employmentStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self-employed">Self-Employed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="annualIncome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Income (Gross)</FormLabel>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 60000" {...field} className="pl-8" onChange={e => field.onChange(transform.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="savings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Savings / Down Payment</FormLabel>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 25000" {...field} className="pl-8" onChange={e => field.onChange(transform.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary">Housing & Mortgage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="currentRentalExpenses" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Monthly Rent</FormLabel>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1500" {...field} className="pl-8" onChange={e => field.onChange(transform.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxMortgage" render={({ field }) => (
                  <FormItem>
                    <LabelWithTooltip label="Max Mortgage Amount" tooltip="The maximum amount you can borrow, as indicated by a mortgage advisor (hypotheekadviseur)." />
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 300000" {...field} className="pl-8" onChange={e => field.onChange(transform.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary">Taxes & Assumptions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField control={form.control} name="interestRate" render={({ field }) => (
                  <FormItem>
                    <LabelWithTooltip label="Interest Rate (%)" tooltip="The annual mortgage interest rate. Check with your advisor for a current estimate." />
                    <div className="relative">
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 4.1" {...field} className="pr-8" onChange={e => field.onChange(transformFloat.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="marginalTaxRate" render={({ field }) => (
                  <FormItem>
                    <LabelWithTooltip label="Marginal Tax Rate (%)" tooltip="Your highest tax bracket percentage. For 2024, this is ~37% for income up to ~€75k, and ~49.5% above that." />
                    <div className="relative">
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 37" {...field} className="pr-8" onChange={e => field.onChange(transformFloat.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="upfrontCostPercentage" render={({ field }) => (
                  <FormItem>
                    <LabelWithTooltip label="Upfront Costs (%)" tooltip="One-time buying costs (kosten koper) as a percentage of the purchase price. Includes transfer tax (2%), notary, etc. Typically 4-6%. Transfer tax may be waived for first-time buyers." />
                    <div className="relative">
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" {...field} className="pr-8" onChange={e => field.onChange(transformFloat.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maintenancePercentage" render={({ field }) => (
                  <FormItem>
                    <LabelWithTooltip label="Maintenance (%)" tooltip="Annual maintenance costs as a percentage of the purchase price. A common estimate is 1%." />
                     <div className="relative">
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" {...field} className="pr-8" onChange={e => field.onChange(transformFloat.output(e))} value={field.value ?? ''} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 pt-2">
                  <FormField control={form.control} name="isFirstTimeBuyer" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <LabelWithTooltip label="First-Time Buyer?" tooltip="Check this if you are buying your first home. If you are under 35, you may be exempt from the 2% transfer tax." />
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="midEligible" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <LabelWithTooltip label="MID Eligible?" tooltip="Is your mortgage (to be) taken out after 2013 and repaid via annuity or linear scheme within 30 years? If so, you are likely eligible for Mortgage Interest Deduction (Hypotheekrenteaftrek)." />
                      </div>
                       <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
         <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Form
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Button } from '../ui/button2';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';
import { useToast } from '../ui/use-toast';

// Validation schema using Zod
const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  electoralArea: z
    .string()
    .min(3, { message: 'Electoral Area must be at least 3 characters' }),
  contact: z.string().min(10, { message: 'Contact must be at least 10 digits' }),
  gender: z.string().min(1, { message: 'Please select a gender' }),
  isConvener: z.boolean().optional(),
});

// Type inferred from schema
type GovernmentAppointeeFormValues = z.infer<typeof formSchema>;

const AddGovernmentAppointeeForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GovernmentAppointeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      electoralArea: '',
      contact: '',
      gender: 'Male',
      isConvener: false,
    },
  });

  const onSubmit = async (data: GovernmentAppointeeFormValues) => {
    try {
      setLoading(true);
      const response = await axios.post(
        'https://kmabackend.onrender.com/api/appointee',
        data
      );
      toast({
        variant: 'default', // Changed from 'success' to 'default'
        title: 'Government Appointee Added',
        description: 'The government appointee was successfully added.',
      });
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Adding Appointee',
        description: 'There was an error submitting the form.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Add Government Appointee</h2>
      </div>
      <Separator />

      {/* Form Container */}
      <div className="shadow-md rounded-lg p-6 mt-6 max-w-xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Appointee's name"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Electoral Area Field */}
            <FormField
              control={form.control}
              name="electoralArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Electoral Area</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Electoral Area"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Field */}
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contact number"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender Field */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Convener Field */}
            <FormField
              control={form.control}
              name="isConvener"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-3">
                    <FormLabel className="mb-0">Is Convener</FormLabel>
                    <FormControl>
                      <Input
                        type="checkbox"
                        disabled={loading}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              disabled={loading}
              className="ml-auto border border-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors duration-300"
              type="submit"
            >
              {loading ? 'Saving...' : 'Add Government Appointee'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddGovernmentAppointeeForm;

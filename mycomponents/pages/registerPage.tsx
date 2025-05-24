"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CardService } from "@/lib/dataSource/user";

export default function RegisterCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phoneNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    nationIdNumber: "",
    dateOfBirth: undefined as Date | undefined
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.phoneNumber || !formData.firstName || !formData.lastName || 
          !formData.nationIdNumber || !formData.dateOfBirth) {
        throw new Error("All required fields must be filled");
      }

      // Prepare card data
      const card: Card = {
        cardNumber: formData.phoneNumber, // Using phone number as card number for SIM registration
        cardHolder: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          nationIdNumber: formData.nationIdNumber,
          dateOfBirth: {
            year: formData.dateOfBirth.getFullYear(),
            month: formData.dateOfBirth.getMonth() + 1,
            day: formData.dateOfBirth.getDate()
          }
        },
        cardId: {
          id: new CardService().createCardId(),
          activationDate: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            day: new Date().getDate()
          }
        }
      };

      // Create card
      await new CardService().createCard(
        card,
        () => {
          setSuccess(true);
          setLoading(false);
          setTimeout(() => router.push("/"), 2000);
        },
        (error) => {
          setError(error);
          setLoading(false);
        }
      );

    } catch (err : any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-xl">SIM Registered Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your phone number has been registered to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Register SIM Card</CardTitle>
          <p className="text-sm text-muted-foreground">
            Link your phone number to your account
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            {/* Phone Number */}
            <div className="space-y-1">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+254 700 123456"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* National ID */}
            <div className="space-y-1">
              <Label htmlFor="nationIdNumber">National ID</Label>
              <Input
                id="nationIdNumber"
                name="nationIdNumber"
                value={formData.nationIdNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? (
                      format(formData.dateOfBirth, "dd/MM/yyyy")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => 
                      setFormData({ ...formData, dateOfBirth: date })
                    }
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm py-1">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register SIM"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Type definitions
type Card = {
  cardNumber: string;
  cardHolder: {
    firstName: string;
    lastName: string;
    email?: string;
    nationIdNumber: string;
    dateOfBirth: {
      year: number;
      month: number;
      day: number;
    };
  };
  cardId: {
    id: string;
    activationDate: {
      year: number;
      month: number;
      day: number;
    };
  };
};
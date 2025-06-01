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
import { toast, useToast } from "@/hooks/use-toast"
import { CardService, User } from "@/lib/dataSource/user";

export default function SimSwapPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phoneNumber: "",
    firstName: "",
    lastName: "",
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
      if (!formData.phoneNumber || !formData.firstName || 
          !formData.lastName || !formData.nationIdNumber || !formData.dateOfBirth) {
        throw new Error("All fields are required");
      }

      // Prepare user data
      const user: User = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationIdNumber: formData.nationIdNumber,
        dateOfBirth: {
          year: formData.dateOfBirth.getFullYear(),
          month: formData.dateOfBirth.getMonth() + 1,
          day: formData.dateOfBirth.getDate()
        }
      };

      // Create temporary card object (only phoneNumber and cardHolder are used in verifyUser)
      const tempCard = { 
        cardNumber: formData.phoneNumber,
        cardHolder: user,
        cardId: { 
          id: "", 
          activationDate: { 
            year: 0, 
            month: 0, 
            day: 0 
          } 
        } 
      };

      // Process SIM swap
      const cardService = new CardService();
      await cardService.simSwap(
        tempCard,
        user,
        () => {
          setSuccess(true);
          setLoading(false);
          toast({
            title: "SIM Swap Successful",
            description: "Your phone number has been transferred to a new SIM card",
          });
          setTimeout(() => router.push("/"), 3000);
        },
        (error) => {
          setError(error);
          setLoading(false);
          toast({
            title: "SIM Swap Failed",
            description: error,
            variant: "destructive"
          });
        }
      );

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

 return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">SIM Swap Request</CardTitle>
          <p className="text-sm text-muted-foreground">
            Transfer your number to a new SIM card
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            {/* Current Phone Number */}
            <div className="space-y-1">
              <Label htmlFor="phoneNumber">Current Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+254 700 123456"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Verification Information */}
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
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>


            {error && (
              <div className="text-red-500 text-sm py-1">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Request SIM Swap"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>)
    }
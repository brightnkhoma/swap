"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertTriangleIcon, XIcon, CheckIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CardService } from "@/lib/dataSource/user";
import { Report } from "@/lib/dataSource/user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function RegisterCardPage() {
  const cardService = useMemo(() => new CardService(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [numberOfTimesIdIsRegisteredBefore, setNumberOfTimesIdIsRegisteredBefore] = useState<number>(0);
  const [availableIdReports, setAvailableIdReports] = useState<Report[]>([]);
  const [showReports, setShowReports] = useState<boolean>(false);
  const [idValidationStatus, setIdValidationStatus] = useState<"valid" | "invalid" | "pending">("pending");

  // Form state
  const [formData, setFormData] = useState({
    phoneNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    nationIdNumber: "",
    dateOfBirth: undefined as Date | undefined
  });

  const onCheckPossibleIdReports = async () => {
    await cardService.checkFraudTransactions(formData.nationIdNumber, setAvailableIdReports);
  };

  const onCheckIfIdIsRegisteredBefore = async (id: string) => {
    await cardService.isNationalIdRegisteredBefore(
      id,
      onIsRegistered,
      onIsNotRegistered,
      onFetchIdError
    );
  };

  useEffect(() => {
    if (formData.nationIdNumber && formData.nationIdNumber.length >= 6) {
      setIdValidationStatus("pending");
      const timer = setTimeout(() => {
        onCheckIfIdIsRegisteredBefore(formData.nationIdNumber);
        onCheckPossibleIdReports();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.nationIdNumber]);

  const onIsNotRegistered = () => {
    setNumberOfTimesIdIsRegisteredBefore(0);
    setIdValidationStatus("valid");
  };

  const onFetchIdError = () => {
    setError("Error validating ID");
    setIdValidationStatus("invalid");
  };

  const onIsRegistered = (count: number) => {
    setNumberOfTimesIdIsRegisteredBefore(count);
    setIdValidationStatus(count >= 3 ? "invalid" : "valid");
  };

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

      // Validate phone number format
      if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
        throw new Error("Please enter a valid phone number");
      }

      // Validate ID registration limit
      if (numberOfTimesIdIsRegisteredBefore >= 3) {
        throw new Error("This ID has reached the maximum number of registrations (3)");
      }

      // Validate fraud reports
      if (availableIdReports.length > 0) {
        throw new Error("This ID is associated with fraud activities and cannot be registered");
      }

      // Validate date of birth (must be at least 18 years old)
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      if (formData.dateOfBirth > minAgeDate) {
        throw new Error("You must be at least 18 years old to register");
      }

      // Prepare card data
      const card: Card = {
        cardNumber: formData.phoneNumber,
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

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <CheckIcon className="h-6 w-6 text-green-500" />
              SIM Registered Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your phone number has been registered to your account.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push("/")} className="mt-4">
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">SIM Card Registration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Link your phone number to your account
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+254 700 123456"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="focus-visible:ring-2 focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Enter your mobile number including country code
              </p>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nationIdNumber">National ID *</Label>
                {formData.nationIdNumber && (
                  <div className="flex items-center gap-2">
                    {idValidationStatus === "pending" && (
                      <span className="text-xs text-yellow-600 flex items-center">
                        <Progress className="h-2 w-4 mr-1" /> Validating...
                      </span>
                    )}
                    {idValidationStatus === "valid" && (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckIcon className="h-3 w-3 mr-1" /> Valid ID
                      </span>
                    )}
                    {idValidationStatus === "invalid" && (
                      <span className="text-xs text-red-600 flex items-center">
                        <XIcon className="h-3 w-3 mr-1" /> Invalid ID
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Input
                id="nationIdNumber"
                name="nationIdNumber"
                value={formData.nationIdNumber}
                onChange={handleChange}
                required
              />
              
              {numberOfTimesIdIsRegisteredBefore > 0 && (
                <Alert variant={numberOfTimesIdIsRegisteredBefore >= 3 ? "destructive" : "default"} className="mt-2">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    This ID has been registered {numberOfTimesIdIsRegisteredBefore} time(s).
                    {numberOfTimesIdIsRegisteredBefore >= 3 && " Maximum limit reached (3)."}
                  </AlertDescription>
                </Alert>
              )}
              
              {availableIdReports.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription className="flex flex-col gap-1">
                    <span>This ID is associated with {availableIdReports.length} fraud report(s).</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-destructive-foreground underline"
                      type="button"
                      onClick={() => setShowReports(true)}
                    >
                      View fraud reports
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
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
                      format(formData.dateOfBirth, "PPP")
                    ) : (
                      <span>Select your birth date</span>
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
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear() - 18}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                You must be at least 18 years old to register
              </p>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                For notifications and account recovery
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                loading || 
                idValidationStatus === "invalid" || 
                numberOfTimesIdIsRegisteredBefore >= 3 || 
                availableIdReports.length > 0
              }
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : "Register SIM"}
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

      {showReports && (
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Fraud Reports</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReports(false)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
              {availableIdReports.length === 0 ? (
                <Alert>
                  <AlertDescription>No fraud reports found for this ID</AlertDescription>
                </Alert>
              ) : (
                availableIdReports.map((report, index) => (
                  <FraudActivityComponent report={report} key={index} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

const FraudActivityComponent: React.FC<{ report: Report }> = ({ report }) => {
  const { reason, transation, reportedAt, reporterPhone } = report;
  const { amount, location, timestamp, recipientAccount } = transation;

  return (
    <div className="w-full p-4 mb-4 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Fraud Report</h3>
        <Badge variant="destructive" className="uppercase">
          {reason}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Reported On</p>
            <p className="text-sm">{new Date(reportedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <p className="text-sm font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'MWK'
              }).format(amount)}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Reporter Phone</p>
          <p className="text-sm">{reporterPhone}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Transaction Date</p>
          <p className="text-sm">{new Date(timestamp).toLocaleString()}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Account Involved</p>
          <p className="text-sm font-mono">{recipientAccount}</p>
        </div>
        
        {location && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-2">Transaction Location</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Latitude</p>
                <p className="text-sm">{location.latitude || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Longitude</p>
                <p className="text-sm">{location.longitude || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
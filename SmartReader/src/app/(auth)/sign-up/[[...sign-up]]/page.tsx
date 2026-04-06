import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1410]">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-serif font-bold text-[#c8965a] mb-4">SmartReader</h1>
        <p className="text-[#a09080] text-lg">Your intelligent reading sanctuary</p>
      </div>
      <SignUp 
        routing="path" 
        path="/sign-up" 
        signInUrl="/sign-in"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#c8965a] hover:bg-[#b5854b] text-[#1a1410]',
            card: 'bg-[#2a2320] border-[#3a332d]',
            headerTitle: 'text-[#e8ddd0]',
            headerSubtitle: 'text-[#a09080]',
            socialButtonsBlockButton: 'bg-[#2e2720] border-[#3a332d] text-[#e8ddd0] hover:bg-[#3a332d]',
            formFieldLabel: 'text-[#a09080]',
            formFieldInput: 'bg-[#2e2720] border-[#3a332d] text-[#e8ddd0]',
            footerActionText: 'text-[#a09080]',
            footerActionLink: 'text-[#c8965a] hover:text-[#b5854b]',
          }
        }}
      />
    </div>
  )
}
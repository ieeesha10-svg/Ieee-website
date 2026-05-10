import React, { useState } from 'react'

import Button from "../../components/Button";
import Input from "../../components/Input";
import RegBG from '../../assets/images/events/registration.jpg'

const eventDetails = [
  { label: "Date",     value: "June 15, 2026" },
  { label: "Time",     value: "6:00 PM - 9:00 PM" },
  { label: "Location", value: "IEEE Innovation Lab, Room 203" },
  { label: "Seats",    value: "150 Available" },
];

const schedule = [
  { time: "6:00 PM", session: "Introduction to Robotics" },
  { time: "6:45 PM", session: "Sensors & Automation Systems" },
  { time: "7:30 PM", session: "Hands-on Session" },
  { time: "8:30 PM", session: "Q&A Session" },
]

const initialForm = {
  fullName: '', email: '', phone: '', university: '', department: '',
  academicYear: '', experience: '', reason: '',
}

export default function EventRegistration() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full Name is required'
    if (!form.email.trim()) errs.email = 'Email Address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.phone.trim()) errs.phone = 'Phone Number is required'
    if (!form.university.trim()) errs.university = 'University is required'
    if (!form.department.trim()) errs.department = 'Department is required'
    if (!form.academicYear) errs.academicYear = 'Academic Year is required'
    if (!form.reason.trim()) errs.reason = 'Please tell us why you want to attend'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitted(true)
  }

  return (
    <section id="event-registration">
      <div
        className="dark:bg-[#020716] relative overflow-hidden bg-cover bg-center py-24"
        style={{ backgroundImage: `url(${RegBG})` }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 container mx-auto px-4">
          <span className="inline-block rounded-full bg-main backdrop-blur-sm text-primary-dark dark:text-primary-light text-sm lg:text-lg font-medium px-6 py-1.5 mb-4">
            Technical
          </span>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
            <span className="text-primary-light">IEEE</span> Robotics Bootcamp 2026
          </h1>
          <p className="text-white text-lg font-bold md:text-xl mt-3 max-w-2xl">
          Explore robotics, automation systems, and intelligent technologies through a hands-on engineering experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-10
					*:border *:border-border *:rounded-3xl *:p-8
        	*:[box-shadow:0px_10px_40px_0px_#2563EB14] *:dark:[box-shadow:0px_10px_40px_0px_#2563EB1F]"
				>

					<div className="col-span-1 lg:col-span-2 flex flex-col h-full relative">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Register Now</h2>
            <p className="text-muted mt-1 mb-8">
              Fill in your details to secure your spot.
            </p>

            <form className="flex flex-col flex-1 gap-5" onSubmit={handleSubmit}>
              {submitted && (
                <div className="rounded-xl border border-green-400/30 bg-green-50 dark:bg-green-900/20 p-4">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Registration submitted successfully!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" name="fullName" placeholder="Enter your full name" value={form.fullName} onChange={handleChange} error={errors.fullName} />
                <Input label="Email Address" name="email" type="email" placeholder="example@gmail.com" value={form.email} onChange={handleChange} error={errors.email} />
                <Input label="Phone Number" name="phone" type="tel" placeholder="+20 100 000 0000" value={form.phone} onChange={handleChange} error={errors.phone} />
                <Input label="University" name="university" placeholder="Your university" value={form.university} onChange={handleChange} error={errors.university} />
                <Input label="Department" name="department" placeholder="Computer Engineering" value={form.department} onChange={handleChange} error={errors.department} />
                <Input label="Academic Year" name="academicYear" type="select" value={form.academicYear} onChange={handleChange} error={errors.academicYear}>
                  <option value="" disabled>Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </Input>
              </div>

              <Input
                label="Previous Experience"
                name="experience"
                type="textarea"
                placeholder="Tell us about any relevant experience with robotics, programming, or electronics..."
                value={form.experience} onChange={handleChange}
              />

              <Input
                label="Why do you want to attend?"
                name="reason"
                type="textarea"
                placeholder="Briefly explain why you're interested in this bootcamp..."
                value={form.reason} onChange={handleChange} error={errors.reason}
              />

              <Button type="submit" variant="default" className="mt-auto w-full bg-primary-dark text-white">
                Complete Registration
              </Button>
            </form>
          </div>

          <div className="col-span-1 flex flex-col h-full gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Event Details</h2>
              <p className="text-muted mt-1">
              	This workshop is designed for students interested in robotics, automation, and intelligent systems. 
              </p>
            </div>

            <div className="flex flex-col gap-6">
	            {eventDetails.map((item, index) => (
	              <div key={index} className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
	                <span className="font-semibold tracking-wider text-primary dark:text-primary-light">{item.label}</span>
	                <p className="text-xs text-foreground font-gotham font-medium mt-1">{item.value}</p>
	              </div>
	            ))}
            </div>

            <div>
              <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4">Schedule</h3>
              <div className="flex flex-col gap-6">
                {schedule.map((item, index) => (
	                <div key={index} className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
		                <span className="font-semibold tracking-wider text-primary dark:text-primary-light">{item.session}</span>
		                <p className="text-xs text-foreground font-gotham font-light mt-1">{item.time}</p>
		              </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

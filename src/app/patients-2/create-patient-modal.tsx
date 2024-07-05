import React, { useState } from 'react'
import { Modal, TextInput, Select, Button, MultiSelect, Group, Textarea, ActionIcon } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Patient } from '@/src/api/model/patient'
import { Session } from 'next-auth'
import { EmergencyContact, PatientBaseScheme, PersonalId } from '@/src/api/scheme'
import validator from 'validator'

const isValidIsraeliID = (id) => {
    if (id.length !== 9 || isNaN(id)) {
        return false;
    }

    const digits = id.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => {
        let step = digit * ((i % 2) + 1);
        if (step > 9) step -= 9;
        return acc + step;
    }, 0);

    return sum % 10 === 0;
};



const PatientFormModal: React.FC<{ opened: boolean, onClose: () => void, session: Session }> = ({ opened, onClose, session }) => {
    const [showOtherIdType, setShowOtherIdType] = useState(false)
    const [emergencyContacts, setEmergencyContacts] = useState([
        { name: '', closeness: '', phone: '' }
    ])

    const form = useForm({
        initialValues: {
            name: '',
            personal_id: { id: '', type: 'ID', other: '' },
            gender: 'unspecified',
            phone_number: '',
            languages: [],
            birth_date: '',
            referred_by: '',
            special_note: '',
            emergency_contacts: [{ name: '', closeness: '', phone: '' }]
        },
        validate: {
            // name validation
            name: (value) => {
                if (!validator.isLength(value, { min: 2, max: 20 })) {
                    return 'Name must be between 2 and 20 characters';
                }
                if (!validator.isAlpha(value)) {
                    return 'Invalid name';
                }
                return null;
            },
            emergency_contacts: {
                // validate the fields of each emergency contact according to the index key
                
                name: (value) => {
                    if (!validator.isLength(value, { min: 2, max: 20 })) {
                        return 'Name must be between 2 and 20 characters';
                    }
                    if (!validator.isAlpha(value)) {
                        return 'Invalid name';
                    }
                    return null;
                },
                closeness: (value) => {
                    if (!validator.isLength(value, { min: 2, max: 20 })) {
                        return 'Closeness must be between 2 and 20 characters';
                    }
                    if (!validator.isAlpha(value)) {
                        return 'Invalid closeness';
                    }
                    return null;
                },
                phone: (value) => {
                    if (!validator.isMobilePhone(value, 'any', { strictMode: true })) {
                        return 'Invalid phone number';
                    }
                    return null;
                }
            },
            // emergency_contacts: (value) => {
            //     if (value.length === 0) {
            //         return 'Emergency contacts are required';
            //     }
            //     // for each emergency contact validate the fields
            //     // validate each text field of each emergency contact according to the index key
            //     for (let i = 0; i < value.length; i++) {
            //         if (!validator.isLength(value[i].name, { min: 2, max: 20 })) {
            //             return 'Name must be between 2 and 20 characters';
            //         }
            //         if (!validator.isAlpha(value[i].name)) {
            //             return 'Invalid name';
            //         }
            //         if (!validator.isLength(value[i].closeness, { min: 2, max: 20 })) {
            //             return 'Closeness must be between 2 and 20 characters';
            //         }
            //         if (!validator.isAlpha(value[i].closeness)) {
            //             return 'Invalid closeness';
            //         }
            //         if (!validator.isMobilePhone(value[i].phone, 'any', { strictMode: true })) {
            //             return 'Invalid phone number';
            //         }
            //     }
            //     return null;
            // },
            // personal id validation
            personal_id: {
                id: (value, values) => {
                    if (values.personal_id.type === 'ID') {
                        if (!isValidIsraeliID(value)) {
                            return 'Invalid Israeli ID';
                        }
                    }
                    return null;
                }
            },
            phone_number: (value) => {
                if (!validator.isMobilePhone(value, 'any', { strictMode: true })) {
                    return 'Invalid phone number';
                }
                return null;
            },
            birth_date: (value) => {
                if (!validator.isDate(value)) {
                    return 'Invalid date';
                }
                return null;
            },
        }
    })

    const handleSubmit = (values: any): void => {
        const new_patient = { ...values }

        if (showOtherIdType == true) {
            new_patient.personal_id.type = new_patient.personal_id.other;
        }
        delete new_patient.personal_id.other;

        const personal_id: PersonalId = { id: new_patient.personal_id.id, type: new_patient.personal_id.type };


        const params = {
            name: new_patient.name,
            personal_id: personal_id,
            birth_date: new Date(new_patient.birth_date),
            gender: new_patient.gender,
            languages: new_patient.languages as string[],
            emergency_contacts: new_patient.emergancy_contacts,
            phone_number: new_patient.phone_number,
            referred_by: new_patient.referred_by,
            special_note: new_patient.special_note
        };

        Patient.create(params, session);


        // console.log(new_patient)
        //   Patient.create(new_patient, session);
    }

    const handleAddEmergencyContact = (): void => {
        setEmergencyContacts([...emergencyContacts, { name: '', closeness: '', phone: '' }])
    }

    const handleRemoveEmergencyContact = (index: number): void => {
        setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index))
    }

    const handleEmergencyContactChange = (index: number, field: string, value: string): void => {
        const updatedContacts = [...emergencyContacts]
        updatedContacts[index][field] = value
        setEmergencyContacts(updatedContacts)
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Patient Information Form">
            <form onSubmit={form.onSubmit((values) => { handleSubmit({ ...values, emergency_contacts: emergencyContacts }) })}>
                <TextInput
                    label="Full Name"
                    placeholder="Henry Smith"
                    {...form.getInputProps('name')}
                    required
                />

                <TextInput
                    label="Personal ID"
                    placeholder="3523651512"
                    {...form.getInputProps('personal_id.id')}
                    required
                />

                <Select
                    label="ID Type"
                    data={['ID', 'Passport', 'Drivers Licence', 'Other']}
                    placeholder="Select ID type"
                    {...form.getInputProps('personal_id.type')}
                    onChange={(value) => {
                        form.setFieldValue('personal_id.type', value)
                        setShowOtherIdType(value === 'Other')
                    }}
                    required
                />

                {showOtherIdType && (
                    <TextInput
                        label="Other ID Type"
                        placeholder="Specify other ID type"
                        {...form.getInputProps('personal_id.other')}
                        required
                    />
                )}

                <Select
                    label="Gender"
                    data={['unspecified', 'male', 'female']}
                    placeholder="Select gender"
                    {...form.getInputProps('gender')}
                />

                <TextInput
                    label="Phone Number"
                    placeholder="972505201591"
                    {...form.getInputProps('phone_number')}
                />

                <MultiSelect
                    label="Languages"
                    data={['Hebrew', 'Spanish', 'English', 'Russian', 'Arabic', 'French']}
                    placeholder="Select languages"
                    {...form.getInputProps('languages')}
                />

                <DateInput
                    label="Birth Date"
                    placeholder="2000-07-21"
                    {...form.getInputProps('birth_date')}
                    required
                />

                {emergencyContacts.map((contact, index) => (
                    <Group key={index} position="apart">
                        <TextInput
                            key={form.key('emergency_contacts.' + `${index}` + '.name')}
                            label="Emergency Contact Name"
                            placeholder="Alexa Smith"
                            value={contact.name}
                            {...form.getInputProps('emergency_contacts.' + `${index}` + '.name')}
                            onChange={(event) => { handleEmergencyContactChange(index, 'name', event.currentTarget.value) }}
                        />
                        <TextInput
                            key={index}
                            label="Closeness"
                            placeholder="Mother"
                            value={contact.closeness}
                            onChange={(event) => { handleEmergencyContactChange(index, 'closeness', event.currentTarget.value) }}
                        />
                        <TextInput
                            key={index}
                            label="Phone"
                            placeholder="972603159352"
                            value={contact.phone}
                            onChange={(event) => { handleEmergencyContactChange(index, 'phone', event.currentTarget.value) }}
                        />
                        {index > 0 && (
                            <ActionIcon color="red" onClick={() => { handleRemoveEmergencyContact(index) }}>
                                <IconTrash size={16} />
                            </ActionIcon>
                        )}
                    </Group>
                ))}

                <Group mt="md" position="center">
                    <Button variant="outline" onClick={handleAddEmergencyContact} size="xs" leftIcon={<IconPlus size={14} />}>
                        Add Emergency Contact
                    </Button>
                </Group>

                <TextInput
                    label="Referred By"
                    placeholder="John"
                    {...form.getInputProps('referred_by')}
                />

                <Textarea
                    label="Special Note"
                    placeholder="Can't answer calls between 12:00 and 20:00"
                    {...form.getInputProps('special_note')}
                />

                <Group mt="md">
                    <Button type="submit" onClick={() => { console.log('submitted') }}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default PatientFormModal
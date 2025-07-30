import { Button, Flex, FormLabel, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';
import MultiContactModel from 'components/commonTableModel/MultiContactModel';
import MultiLeadModel from 'components/commonTableModel/MultiLeadModel';
import Spinner from 'components/spinner/Spinner';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { LiaMousePointerSolid } from 'react-icons/lia';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MeetingSchema } from 'schema';
import { getApi, putApi } from 'services/api';

const EditMeeting = (props) => {
    const { onClose, isOpen, setAction, meetingData, from, fetchData, view } = props
    const [leaddata, setLeadData] = useState([])
    const [contactdata, setContactData] = useState([])
    const [isLoding, setIsLoding] = useState(false)
    const [contactModelOpen, setContactModel] = useState(false);
    const [leadModelOpen, setLeadModel] = useState(false);
    const todayTime = new Date().toISOString().split('.')[0];
    const leadData = useSelector((state) => state?.leadData?.data);
    const user = JSON.parse(localStorage.getItem('user'))
    const contactList = useSelector((state) => state?.contactData?.data)

    const initialValues = {
        agenda: meetingData?.agenda || '',
        attendes: meetingData?.attendes || [],
        attendesLead: meetingData?.attendesLead || [],
        location: meetingData?.location || '',
        related: meetingData?.related || 'None',
        dateTime: meetingData?.dateTime ? dayjs(meetingData.dateTime).format('YYYY-MM-DDTHH:mm') : '',
        notes: meetingData?.notes || '',
        createFor: meetingData?.createFor || '',
        createBy: user?._id,
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: MeetingSchema,
        enableReinitialize: true,
        onSubmit: (values, { resetForm }) => {
            EditData();
        },
    });
    const { errors, touched, values, handleBlur, handleChange, handleSubmit, setFieldValue } = formik

    const EditData = async () => {
        try {
            setIsLoding(true);
            const payload = {
                agenda: values.agenda,
                dateTime: values.dateTime,
                location: values.location,
                attendes: values.attendes,
                attendesLead: values.attendesLead,
                notes: values.notes,
                related: values.related,
                createFor: values.createFor,
                createBy: values.createBy
            };
            
            let response = await putApi(`api/meeting/edit/${meetingData?._id}`, payload);
            if (response.status === 200) {
                toast.success("Meeting updated successfully");
                onClose();
                setAction((pre) => !pre);
            }
        } catch (error) {
            console.error('Meeting update error:', error);
            toast.error("Failed to update meeting");
        } finally {
            setIsLoding(false);
        }
    };

    const fetchAllData = async () => {
        try {
            // Fetch contacts if related is Contact
            if (values.related === 'Contact') {
                const contactResponse = await getApi('api/contact');
                if (contactResponse.status === 200) {
                    setContactData(contactResponse.data);
                }
            }
            // Fetch leads if related is Lead
            if (values.related === 'Lead') {
                const leadResponse = await getApi('api/lead');
                if (leadResponse.status === 200) {
                    setLeadData(leadResponse.data);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        fetchAllData();
    }, [meetingData?._id, values.related])

    const extractLabels = (selectedItems) => {
        return selectedItems.map((item) => item._id);
    };

    const countriesWithEmailAsLabel = (values.related === "Contact" ? contactdata : leaddata)?.map((item) => ({
        ...item,
        value: item._id,
        label: values.related === "Contact" ? `${item.firstName} ${item.lastName}` : item.leadName,
    }));

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent height={"580px"}>
                <ModalHeader>Edit Meeting</ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY={"auto"} height={"400px"}>
                    {/* Contact Model  */}
                    <MultiContactModel data={contactdata} isOpen={contactModelOpen} onClose={setContactModel} fieldName='attendes' setFieldValue={setFieldValue} />
                    {/* Lead Model  */}
                    <MultiLeadModel data={leaddata} isOpen={leadModelOpen} onClose={setLeadModel} fieldName='attendesLead' setFieldValue={setFieldValue} />

                    <Grid templateColumns="repeat(12, 1fr)" gap={3}>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Agenda<Text color={"red"}>*</Text>
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} onBlur={handleBlur}
                                value={values.agenda}
                                name="agenda"
                                placeholder='Agenda'
                                fontWeight='500'
                                borderColor={errors.agenda && touched.agenda ? "red.300" : null}
                            />
                            <Text fontSize='sm' mb='10px' color={'red'}> {errors.agenda && touched.agenda && errors.agenda}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }} >
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Related To<Text color={"red"}>*</Text>
                            </FormLabel>
                            <RadioGroup onChange={(e) => setFieldValue('related', e)} value={values.related}>
                                <Stack direction='row'>
                                    <Radio value='Contact'>Contact</Radio>
                                    <Radio value='Lead'>Lead</Radio>
                                </Stack>
                            </RadioGroup>
                            <Text mb='10px' color={'red'} fontSize='sm'> {errors.related && touched.related && errors.related}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Create For
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} onBlur={handleBlur}
                                value={values.createFor}
                                name="createFor"
                                placeholder='Create For'
                                fontWeight='500'
                                borderColor={errors.createFor && touched.createFor ? "red.300" : null}
                            />
                            <Text mb='10px' color={'red'} fontSize='sm'> {errors.createFor && touched.createFor && errors.createFor}</Text>
                        </GridItem>
                        {(values.related === "Contact" ? (contactdata?.length ?? 0) > 0 : (leaddata?.length ?? 0) > 0) && values.related &&

                            <GridItem colSpan={{ base: 12 }}>
                                <Flex alignItems={'end'} justifyContent={'space-between'} >
                                    <Text w={'100%'} >
                                        <CUIAutoComplete
                                            label={`Choose Preferred Attendes ${values.related === "Contact" ? "Contact" : values.related === "Lead" && "Lead"}`}
                                            placeholder="Type a Name"
                                            name="attendes"
                                            items={countriesWithEmailAsLabel}
                                            className='custom-autoComplete'
                                            selectedItems={countriesWithEmailAsLabel?.filter((item) => values.related === "Contact" ? values?.attendes.includes(item._id) : values.related === "Lead" && values?.attendesLead.includes(item._id))}
                                            onSelectedItemsChange={(changes) => {
                                                const selectedLabels = extractLabels(changes.selectedItems);
                                                values.related === "Contact" ? setFieldValue('attendes', selectedLabels) : values.related === "Lead" && setFieldValue('attendesLead', selectedLabels)
                                            }}
                                        />
                                    </Text>
                                    <IconButton mb={6} onClick={() => values.related === "Contact" ? setContactModel(true) : values.related === "Lead" && setLeadModel(true)} fontSize='25px' icon={<LiaMousePointerSolid />} />
                                </Flex>
                                <Text color={'red'}> {errors.attendes && touched.attendes && errors.attendes}</Text>
                            </GridItem>
                        }
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Location
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} onBlur={handleBlur}
                                value={values.location}
                                name="location"
                                placeholder='Location'
                                fontWeight='500'
                                borderColor={errors.location && touched.location ? "red.300" : null}
                            />
                            <Text mb='10px' color={'red'} fontSize='sm'> {errors.location && touched.location && errors.location}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Date Time<Text color={"red"}>*</Text>
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                type='datetime-local'
                                onChange={handleChange} onBlur={handleBlur}
                                min={dayjs(todayTime).format('YYYY-MM-DD HH:mm')}
                                value={values.dateTime}
                                name="dateTime"
                                placeholder='Date Time'
                                fontWeight='500'
                                borderColor={errors.dateTime && touched.dateTime ? "red.300" : null}
                            />
                            <Text fontSize='sm' mb='10px' color={'red'}> {errors.dateTime && touched.dateTime && errors.dateTime}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Notes
                            </FormLabel>
                            <Textarea
                                resize={'none'}
                                fontSize='sm'
                                placeholder='Notes'
                                onChange={handleChange} onBlur={handleBlur}
                                value={values.notes}
                                name="notes"
                                fontWeight='500'
                                borderColor={errors.notes && touched.notes ? "red.300" : null}
                            />
                            <Text mb='10px' color={'red'}> {errors.notes && touched.notes && errors.notes}</Text>
                        </GridItem>

                    </Grid>


                </ModalBody>
                <ModalFooter>
                    <Button size="sm" variant='brand' me={2} disabled={isLoding ? true : false} onClick={handleSubmit}>{isLoding ? <Spinner /> : 'Update'}</Button>
                    <Button sx={{
                        textTransform: "capitalize",
                    }} variant="outline"
                        colorScheme="red" size="sm" onClick={() => {
                            onClose()
                        }}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default EditMeeting 
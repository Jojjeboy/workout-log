import { useState, useEffect } from 'react';
import { Container, TextInput, Textarea, Button, Card, Group, Stack, Title, Loader, Center, Text, ActionIcon, Collapse } from '@mantine/core';
import { IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { useNotes } from '../../hooks/useNotes';

export function NotesPage() {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { data: notes, isLoading, error, addNote, isAdding, deleteNote } = useNotes() as any;

    useEffect(() => {
        console.log('NotesPage - data:', notes);
        console.log('NotesPage - isLoading:', isLoading);
        console.log('NotesPage - error:', error);
    }, [notes, isLoading, error]);

    const handleAdd = async () => {
        if (!title.trim()) return;
        addNote({ title: title.trim(), content: content.trim() });
        setTitle('');
        setContent('');
        setShowForm(false);
    };

    const handleCancel = () => {
        setTitle('');
        setContent('');
        setShowForm(false);
    };

    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                <div>
                    <Title order={2} mb="xs">Notes</Title>
                    <Text className="muted-text" size="sm">Keep track of ideas and future improvements</Text>
                </div>

                {/* Add Note Button - Full Width */}
                <Button
                    fullWidth
                    size="md"
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? 'filled' : 'light'}
                >
                    {showForm ? 'Cancel' : 'Add New Note'}
                </Button>

                {/* Error Display */}
                {error && (
                    <Card className="glass-card" p="md" style={{ backgroundColor: 'rgba(255, 100, 100, 0.1)' }}>
                        <Text size="sm" c="red">
                            Error: {error?.message || JSON.stringify(error)}
                        </Text>
                    </Card>
                )}

                {/* Form - Collapsible */}
                <Collapse in={showForm}>
                    <Card className="glass-card" p="lg">
                        <Stack>
                            <TextInput
                                placeholder="Note title"
                                value={title}
                                onChange={(e) => setTitle(e.currentTarget.value)}
                                autoFocus
                            />
                            <Textarea
                                placeholder="Write your note here..."
                                value={content}
                                onChange={(e) => setContent(e.currentTarget.value)}
                                minRows={4}
                            />
                            <Group justify="flex-end">
                                <Button variant="light" onClick={handleCancel} leftSection={<IconX size={16} />}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAdd}
                                    loading={isAdding}
                                    leftSection={<IconPlus size={16} />}
                                    disabled={!title.trim()}
                                >
                                    Save Note
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Collapse>

                {/* Notes List */}
                {isLoading ? (
                    <Center style={{ height: 200 }}>
                        <Loader />
                    </Center>
                ) : (
                    <Stack gap="md">
                        {(notes || []).length > 0 ? (
                            (notes || []).map((n: any) => (
                                <Card key={n.id} className="glass-card" p="lg">
                                    <Group justify="space-between" align="flex-start">
                                        <Stack gap="xs" style={{ flex: 1 }}>
                                            <Text fw={600} size="md">{n.title}</Text>
                                            <Text size="sm" className="muted-text" style={{ whiteSpace: 'pre-wrap' }}>{n.content}</Text>
                                        </Stack>
                                        <ActionIcon
                                            color="red"
                                            variant="light"
                                            onClick={() => deleteNote(n.id)}
                                            title="Delete note"
                                        >
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </Group>
                                </Card>
                            ))
                        ) : (
                            <Card className="glass-card" p="lg">
                                <Text ta="center" className="muted-text">
                                    No notes yet — click "Add New Note" to create one
                                </Text>
                            </Card>
                        )}
                    </Stack>
                )}
            </Stack>
        </Container>
    );
}

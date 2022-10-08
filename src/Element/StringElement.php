<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Symfony\Contracts\Translation\TranslatorInterface;

/** base text input html element */
class StringElement extends AbstractElement
{
    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly bool $required = true
    ) {
    }

    protected function getType(): string
    {
        return 'string';
    }

    protected function renderElement(mixed $value, ?TranslatorInterface $translator): array
    {
        if (null !== $value && false === \is_string($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
